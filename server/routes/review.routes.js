import { Router } from "express";
import { createReview, deleteReview } from "../controllers/review.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();
router.post  ("/",    protect, createReview);
router.delete("/:id", protect, deleteReview);
export default router;