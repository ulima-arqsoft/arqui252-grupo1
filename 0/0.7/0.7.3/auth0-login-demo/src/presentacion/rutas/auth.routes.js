import express from "express";
import { AuthController } from "../controladores/auth.controller.js";

const router = express.Router();

router.get("/", AuthController.home);

export default router;
