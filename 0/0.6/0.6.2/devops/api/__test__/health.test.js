const request = require("supertest");
const http = require("http");
const express = require("express");

function createApp() {
  const app = express();
  app.get("/health", (_req, res) => res.json({ ok: true }));
  return app;
}

describe("health endpoint", () => {
  let server;
  afterEach(() => server && server.close());

  test("responde ok", async () => {
    const app = createApp();
    server = http.createServer(app).listen();
    const res = await request(server).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
