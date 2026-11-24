import "dotenv/config";
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "test-jwt-secret-key-32-chars-long";
}

import assert from "node:assert/strict";
import app from "../app.js";

async function runCheck() {
  const server = app.listen(0);
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to obtain port for test server");
  }

  const port = address.port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200, "Health check should return status 200");
    const healthData = await healthRes.json();
    assert.equal(healthData.success, true, "Health check response should be successful");

    const unauthTicketRes = await fetch(`${baseUrl}/api/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test", description: "Desc" }),
    });
    assert.equal(
      unauthTicketRes.status,
      401,
      "POST /api/tickets without JWT should return 401 Unauthorized"
    );

    console.log("All runnable checks passed successfully.");
  } finally {
    server.close();
  }
}

runCheck().catch((err) => {
  console.error("Sanity check failed:", err);
  process.exit(1);
});
