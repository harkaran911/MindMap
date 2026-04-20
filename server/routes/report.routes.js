import { Router } from "express";
import { createReport } from "../controllers/report.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.post("/", protect, createReport);
export default router;