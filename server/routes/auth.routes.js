import { Router } from "express";
import { register, login, logout, refresh, verifyEmail } from "../controllers/auth.controller.js";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { message: "Too many login attempts, please try again after 15 minutes" }
});

const router = Router();
router.post("/register",       authLimiter, register);
router.post("/login",          authLimiter, login);
router.post("/logout",         logout);
router.post("/refresh",        refresh);
router.get ("/verify/:token",  verifyEmail);
export default router;