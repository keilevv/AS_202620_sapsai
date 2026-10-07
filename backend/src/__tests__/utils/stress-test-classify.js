/**
 * EPHEMERAL stress test for classifier API
 *
 * Runs the real Express app IN-PROCESS against an isolated environment:
 * - DATABASE_URL  -> ephemeral local PostgreSQL (leaf_classifier_stress)
 * - R2 uploads    -> mocked at the service level (no real bucket writes)
 * - Classifier    -> real FastAPI service (localhost:8000), performs inference
 *
 * Nothing is persisted to the production Prisma Cloud DB or the real R2 bucket.
 * The ephemeral DB is dropped on completion.
 */

import autocannon from "autocannon";
import fs from "fs";
import FormData from "form-data";
import { spawnSync } from "child_process";

function cleanUploads() {
  const dir = `${process.cwd()}/uploads`;
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) fs.unlinkSync(`${dir}/${f}`);
  }
}

const EPHEMERAL_DB = "leaf_classifier_stress";
const DB_URL = `postgres://postgres:postgres@localhost:5432/${EPHEMERAL_DB}?sslmode=disable`;

// ---------------------------------------------------------------------------
// 1. Bootstrap the ephemeral database (create + push schema + seed via app)
// ---------------------------------------------------------------------------
function bootstrapEphemeralDb() {
  cleanUploads();
  const psql = (sql) =>
    spawnSync("psql", ["-h", "localhost", "-p", "5432", "-U", "postgres", "-c", sql], {
      env: { ...process.env, PGPASSWORD: "postgres" },
      encoding: "utf8",
    });
  const res = psql(`DROP DATABASE IF EXISTS ${EPHEMERAL_DB} (FORCE)`);
  if (res.status !== 0) {
    const legacy = psql(`DROP DATABASE IF EXISTS ${EPHEMERAL_DB}`);
    if (legacy.status !== 0) throw new Error(`Failed to drop DB: ${legacy.stderr}`);
  }
  const create = psql(`CREATE DATABASE ${EPHEMERAL_DB}`);
  if (create.status !== 0) throw new Error(`Failed to create DB: ${create.stderr}`);

  const push = spawnSync("bunx", ["prisma", "db", "push", "--skip-generate"], {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: DB_URL },
    encoding: "utf8",
  });
  if (push.status !== 0) throw new Error(`prisma db push failed: ${push.stderr}`);
}

// ---------------------------------------------------------------------------
// 2. Set isolated environment BEFORE importing the app
// ---------------------------------------------------------------------------
bootstrapEphemeralDb();

process.env.DATABASE_URL = DB_URL;
process.env.CLASSIFY_SERVICE_URL = "http://localhost:8000";
process.env.JWT_ACCESS_SECRET = "ephemeral-access-secret";
process.env.JWT_REFRESH_SECRET = "ephemeral-refresh-secret";
process.env.SESSION_SECRET = "ephemeral-session-secret";
process.env.DEFAULT_EMAIL = "adminleaf@yopmail.com";
process.env.DEFAULT_PASSWORD = "admin123";
process.env.DEFAULT_USERNAME = "admin";
process.env.R2_ACCOUNT_ID = "ephemeral";
process.env.R2_ACCESS_KEY_ID = "ephemeral";
process.env.R2_SECRET_ACCESS_KEY = "ephemeral";
process.env.R2_BUCKET_NAME = "ephemeral-bucket";
process.env.R2_PUBLIC_BASE_URL = "https://ephemeral.r2.dev";
process.env.GOOGLE_CLIENT_ID = "ephemeral";
process.env.GOOGLE_CLIENT_SECRET = "ephemeral";
process.env.GOOGLE_CALLBACK_URL = "http://localhost:5000/api/auth/google/callback";

const { default: app } = await import("../../app");
const { R2Service } = await import("../../services/r2Service");

// Mock R2 at the service level: no real Cloudflare bucket writes.
R2Service.uploadFile = async (_filePath, key, _contentType) => ({
  success: true,
  key,
  url: `https://ephemeral.r2.dev/${key}`,
});

// ---------------------------------------------------------------------------
// 3. Start the in-process app on an ephemeral port
// ---------------------------------------------------------------------------
const server = app.listen(0, "127.0.0.1", () => {
  const port = server.address().port;
  runTest(port).finally(async () => {
    server.close();
    await (await import("../../lib/prisma")).default.$disconnect();
    spawnSync("psql", ["-h", "localhost", "-p", "5432", "-U", "postgres", "-c", `DROP DATABASE IF EXISTS ${EPHEMERAL_DB} (FORCE)`], {
      env: { ...process.env, PGPASSWORD: "postgres" },
      encoding: "utf8",
    });
    cleanUploads();
    console.log("✓ Ephemeral DB dropped and uploads cleaned. Nothing persisted.");
    process.exit(0);
  });
});

async function runTest(port) {
  const base = `http://127.0.0.1:${port}`;

  console.log("Seeding default admin...");
  let attempts = 0;
  let token = null;
  while (attempts < 30) {
    try {
      const login = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: process.env.DEFAULT_EMAIL,
          password: process.env.DEFAULT_PASSWORD,
        }),
      });
      const data = await login.json();
      if (login.ok && data.accessToken) {
        token = data.accessToken;
        break;
      }
    } catch {
      // app still booting
    }
    attempts++;
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!token) {
    console.error("Failed to obtain auth token after seeding timeout");
    process.exit(1);
  }
  console.log("Authenticated. Running stress test...");

  const img = fs.readFileSync(`${import.meta.dir}/test-image.jpg`);
  const fd = new FormData();
  fd.append("image", img, "test-image.jpg");
  const body = fd.getBuffer();
  const headers = Object.assign(fd.getHeaders(), {
    Authorization: `Bearer ${token}`,
  });

  const instance = autocannon({
    url: base,
    connections: 50,
    amount: 100,
    requests: [{ method: "POST", path: "/api/plant-classifier/upload", headers, body }],
  });

  autocannon.track(instance);

  await new Promise((res, rej) => {
    const timeout = setTimeout(() => rej(new Error("Timeout")), 120000);
    instance.on("done", () => {
      clearTimeout(timeout);
      res();
    });
    instance.on("error", (e) => {
      clearTimeout(timeout);
      rej(e);
    });
  });
  console.log("✓ Stress test completed.");
}