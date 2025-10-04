import express from "express";
import AuthController from "../controllers/authController.js";

const router = express.Router();
const authController = new AuthController();

// Login
router.post("/login", authController.login);

// Refresh token
router.post("/refresh", authController.refresh);

// Logout
router.post("/logout", authController.logout);

// Verificar token
router.get("/verify", authController.verifyAuth);

export default router;