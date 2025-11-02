import express from "express";
import { authMiddleware } from "./auth/auth.config.js";
import authRoutes from "../presentacion/rutas/auth.routes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware de autenticación Auth0
app.use(authMiddleware);

// Rutas
app.use("/", authRoutes);

// Inicio del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en marcha en ${process.env.AUTH0_BASE_URL}`);
});
