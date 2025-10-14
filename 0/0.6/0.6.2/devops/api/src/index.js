const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.API_BASE_URL || "https://example.local";

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now(), apiBase: API_BASE_URL });
});

app.listen(PORT, () => console.log(`API up on :${PORT}`));
