import autocannon from "autocannon"
import fs from "fs"
import FormData from "form-data"

async function runTest(amount = 5000, connections = 50) {
  console.log("Authenticating...");
  const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "adminleaf@yopmail.com",
      password: "admin123",
    }),
  });

  const loginData = await loginResponse.json();

  if (!loginResponse.ok || !loginData.accessToken) {
    console.error("Login failed!", loginData);
    process.exit(1);
  }

  console.log("Login successful! Starting stress test...");
  const token = loginData.accessToken;

  const imagePath = `${import.meta.dir}/test-image.jpg`
  const image = fs.readFileSync(imagePath)

  const form = new FormData()
  form.append("image", image, "test-image.jpg")

  const body = form.getBuffer()
  const headers = Object.assign(form.getHeaders(), {
    Authorization: `Bearer ${token}`
  });

  const instance = autocannon({
    url: "http://localhost:5000",
    connections: connections,
    amount: amount, // send number of requests
    requests: [
      {
        method: "POST",
        path: "/api/plant-classifier/upload",
        headers,
        body
      }
    ]
  }, console.log);

  autocannon.track(instance, { renderProgressBar: true });
}

runTest();