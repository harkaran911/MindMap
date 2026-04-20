import Appointment  from "../models/Appointment.model.js";
import Availability from "../models/Availability.model.js";
import Resource     from "../models/Resource.model.js";
import User         from "../models/User.model.js";
import { sendAppointmentConfirmation, sendAppointmentCancellation } from "../utils/mailer.js";

const DAY_MAP = ["sun","mon","tue","wed","thu","fri","sat"];

// GET /api/appointments/availability/:resourceId?date=2026-04-10
export const getAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date required" });

    const availability = await Availability.findOne({ resourceId: req.params.resourceId });
    if (!availability) return res.json({ slots: [] });

    const dayName = DAY_MAP[new Date(date).getDay()];
    const allSlots = availability.weeklySlots[dayName] || [];

    // filter out already booked slots
    const booked = availability.bookedSlots
      .filter(b => b.date === date)
      .map(b => b.slot);

    const available = allSlots.filter(s => !booked.includes(s));
    res.json({ slots: available, booked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/appointments
export const bookAppointment = async (req, res) => {
  try {
    const { resourceId, date, slot, note } = req.body;

    // Atomic lock: Only push if the exact date+slot combination doesn't exist in the array
    const updatedAvailability = await Availability.findOneAndUpdate(
      { 
        resourceId,
        bookedSlots: { $not: { $elemMatch: { date, slot } } }
      },
      { $push: { bookedSlots: { date, slot } } },
      { new: true }
    );

    if (!updatedAvailability) {
       const exists = await Availability.findOne({ resourceId });
       if (!exists) return res.status(400).json({ message: "Resource has no availability set" });
       return res.status(400).json({ message: "Slot already taken (concurrency lock)" });
    }

    // create appointment safely
    const appointment = await Appointment.create({
      userId: req.user._id,
      resourceId,
      date: new Date(date),
      slot,
      note,
    });

    res.status(201).json({ appointment });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Slot already taken" });
    res.status(500).json({ message: err.message });
  }
};

// GET /api/appointments/my
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user._id })
      .populate("resourceId", "name type address phone")
      .sort({ date: 1 })
      .limit(50);
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/appointments/:id/cancel
export const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("resourceId", "name")
      .populate("userId", "name email");

    if (!appointment) return res.status(404).json({ message: "Not found" });
    if (appointment.userId._id.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });
    if (appointment.status === "cancelled")
      return res.status(400).json({ message: "Already cancelled" });

    appointment.status = "cancelled";
    appointment.cancelReason = req.body?.reason || "Cancelled by user";
    await appointment.save();

    // free the slot
    const dateStr = appointment.date.toISOString().split("T")[0];
    await Availability.updateOne(
      { resourceId: appointment.resourceId._id },
      { $pull: { bookedSlots: { date: dateStr, slot: appointment.slot } } }
    );

    // send cancellation email
    await sendAppointmentCancellation(appointment.userId.email, {
      name:         appointment.userId.name,
      resourceName: appointment.resourceId.name,
      date:         dateStr,
      slot:         appointment.slot,
    });

    res.json({ message: "Appointment cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/appointments/:id/confirm (admin only)
export const confirmAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("resourceId", "name")
      .populate("userId", "name email");

    if (!appointment) return res.status(404).json({ message: "Not found" });

    appointment.status = "confirmed";
    await appointment.save();

    const dateStr = appointment.date.toISOString().split("T")[0];

    await sendAppointmentConfirmation(appointment.userId.email, {
      name:         appointment.userId.name,
      resourceName: appointment.resourceId.name,
      date:         dateStr,
      slot:         appointment.slot,
    });

    res.json({ appointment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/appointments/all (admin)
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("userId",     "name email")
      .populate("resourceId", "name type")
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/appointments/availability/:resourceId (admin sets availability)
export const setAvailability = async (req, res) => {
  try {
    const { weeklySlots, slotDuration } = req.body;
    const availability = await Availability.findOneAndUpdate(
      { resourceId: req.params.resourceId },
      { weeklySlots, slotDuration },
      { upsert: true, new: true }
    );
    res.json({ availability });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};