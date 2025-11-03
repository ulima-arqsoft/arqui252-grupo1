const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");
const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

//app.options('*', cors());

// --- Azure Key Vault client ---
const credential = new DefaultAzureCredential();
const keyVaultName = (process.env.KEY_VAULT_NAME || "").trim();
if (!keyVaultName) throw new Error("KEY_VAULT_NAME is empty");
const url = `https://${keyVaultName}.vault.azure.net`;
const client = new SecretClient(url, credential);

// --- Cache simple del ORDER_LIMIT para no consultar Key Vault en cada request ---
const SECRET_NAME = process.env.SECRET_NAME || "ORDER_LIMIT";
let cachedLimit = null;
let lastFetch = 0;
const TTL_MS = 60_000; // refrescar cada 60s

async function getOrderLimit(force = false) {
  const now = Date.now();
  if (!force && cachedLimit !== null && now - lastFetch < TTL_MS) return cachedLimit;

  const sec = await client.getSecret(SECRET_NAME);
  cachedLimit = Number(String(sec.value || "0").trim());
  lastFetch = now;
  if (Number.isNaN(cachedLimit)) cachedLimit = 0;
  return cachedLimit;
}

// --- Estado en memoria para la demo ---
let ordersCount = 0;

// Health / ver secreto (solo DEMO)
app.get("/secret", async (_req, res) => {
  try {
    const sec = await client.getSecret(SECRET_NAME);
    res.json({ ok: true, name: sec.name, value: sec.value });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Estado actual (útil para el front)
app.get("/status", async (_req, res) => {
  try {
    const limit = await getOrderLimit();
    res.json({ ok: true, ordersCount, limit, remaining: Math.max(limit - ordersCount, 0) });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Endpoint que simula la creación de un pedido usando el ORDER_LIMIT del Key Vault
app.post("/orders", async (_req, res) => {
  try {
    const limit = await getOrderLimit();
    if (ordersCount >= limit) {
      return res.status(429).json({
        ok: false,
        message: `Se alcanzó el límite diario de pedidos (${limit}).`
      });
    }
    ordersCount += 1;
    const id = `ORD-${ordersCount.toString().padStart(4, "0")}`;
    return res.status(201).json({
      ok: true,
      id,
      used: ordersCount,
      limit,
      remaining: Math.max(limit - ordersCount, 0)
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Reset (solo para pruebas)
app.post("/reset", (_req, res) => {
  ordersCount = 0;
  res.json({ ok: true, ordersCount });
});

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
