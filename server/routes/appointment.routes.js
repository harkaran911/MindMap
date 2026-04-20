import { Router } from "express";
import {
  getAvailability, bookAppointment, getMyAppointments,
  cancelAppointment, confirmAppointment, getAllAppointments,
  setAvailability
} from "../controllers/appointment.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

router.get ("/availability/:resourceId",       getAvailability);
router.post("/",                          protect, bookAppointment);
router.get ("/my",                        protect, getMyAppointments);
router.patch("/:id/cancel",              protect, cancelAppointment);
router.patch("/:id/confirm",             protect, adminOnly, confirmAppointment);
router.get ("/all",                       protect, adminOnly, getAllAppointments);
router.post("/availability/:resourceId", protect, adminOnly, setAvailability);

export default router;