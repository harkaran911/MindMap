import { Router } from "express";
import { getStats, getPendingResources, approveResource, rejectResource, getReports, resolveReport } from "../controllers/admin.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protect, adminOnly); // all admin routes protected

router.get   ("/stats",                    getStats);
router.get   ("/resources/pending",        getPendingResources);
router.patch ("/resources/:id/approve",    approveResource);
router.patch ("/resources/:id/reject",     rejectResource);
router.get   ("/reports",                  getReports);
router.patch ("/reports/:id/resolve",      resolveReport);
export default router;