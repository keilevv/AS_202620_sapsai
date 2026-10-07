/**
 * Integration tests for backend routes
 * 
 * Tests the complete flow: HTTP request → route handler → controller → response
 * Verifies that route definitions match their corresponding service endpoints
 */

import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import request from "supertest";
import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import * as jwtUtils from "../../utils/jwt";
import { createMockRequest, createMockResponse, createMockNextFunction } from "../helpers/mockRequest";
import { mockUser, mockAdminUser } from "../helpers/testUtils";

// Create Express app with all routes (similar to server.ts but for testing)
function createTestApp() {
  const app = express();

  // CORS middleware
  app.use(
    cors({
      origin: ["http://localhost:5173", "http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Session middleware
  app.use(
    session({
      secret: "test-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
      },
    })
  );

  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

  // Import and use all routes - use absolute paths from test file location
  const adminRouter = require("/home/keilevv/projects/leaf_classifier/backend/src/routes/admin").default;
  const authRouter = require("/home/keilevv/projects/leaf_classifier/backend/src/routes/auth").default;
  const userRouter = require("/home/keilevv/projects/leaf_classifier/backend/src/routes/user").default;
  const speciesRouter = require("/home/keilevv/projects/leaf_classifier/backend/src/routes/species").default;
  const plantClassifierRouter = require("/home/keilevv/projects/leaf_classifier/backend/src/routes/plantClassifier").default;

  app.use("/api/auth", authRouter);
  app.use("/api/plant-classifier", plantClassifierRouter);
  app.use("/api/users", userRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/species", speciesRouter);

  return app;
}

describe("Backend Route Integration", () => {
  let testApp: any;

  beforeEach(() => {
    testApp = createTestApp();
  });

  it("POST /api/auth/login should return user and token", async () => {
    const response = await request(testApp)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("accessToken");
  });

  it("POST /api/auth/register should create a new user", async () => {
    const response = await request(testApp)
      .post("/api/auth/register")
      .send({
        fullName: "Test User",
        email: "test2@example.com",
        password: "password123",
        phone: "1234567890",
      });

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty("email", "test2@example.com");
  });

  it("GET /api/auth/me should return user when authenticated", async () => {
    const loginResp = await request(testApp)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });
    
    const token = loginResp.body.accessToken;

    const response = await request(testApp)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");
  });

  it("GET /api/auth/me should return 401 when not authenticated", async () => {
    const response = await request(testApp).get("/api/auth/me");

    expect(response.status).toBe(401);
  });

  it("GET /api/admin/classifications should require authentication", async () => {
    const response = await request(testApp).get("/api/admin/classifications");

    expect(response.status).toBe(401);
  });

  it("GET /api/admin/classifications should return classifications when authenticated", async () => {
    const loginResp = await request(testApp)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });
    
    const token = loginResp.body.accessToken;

    const response = await request(testApp)
      .get("/api/admin/classifications")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it("GET /api/users/:id should require authentication", async () => {
    const response = await request(testApp).get("/api/users/1");

    expect(response.status).toBe(401);
  });

  it("GET /api/users/:id should return user when authenticated", async () => {
    const loginResp = await request(testApp)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });
    
    const token = loginResp.body.accessToken;

    const response = await request(testApp)
      .get("/api/users/1")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("email");
  });

  it("GET /api/species should require authentication", async () => {
    const response = await request(testApp).get("/api/species");

    expect(response.status).toBe(401);
  });

  it("GET /api/species should return species when authenticated", async () => {
    const loginResp = await request(testApp)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });
    
    const token = loginResp.body.accessToken;

    const response = await request(testApp)
      .get("/api/species")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it("GET /api/plant-classifier/models should require authentication", async () => {
    const response = await request(testApp).get("/api/plant-classifier/models");

    expect(response.status).toBe(401);
  });

  it("GET /api/plant-classifier/models should return models when authenticated", async () => {
    const loginResp = await request(testApp)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });
    
    const token = loginResp.body.accessToken;

    const response = await request(testApp)
      .get("/api/plant-classifier/models")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.models)).toBe(true);
  });

  it("POST /api/plant-classifier/upload should require authentication", async () => {
    const response = await request(testApp)
      .post("/api/plant-classifier/upload")
      .field("test", "data");

    expect(response.status).toBe(401);
  });
});
