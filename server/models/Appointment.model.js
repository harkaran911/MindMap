import mongoose from "mongoose";
import { encrypt, decrypt } from "../utils/encryption.js";

const appointmentSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
  resourceId:  { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
  date:        { type: Date,   required: true },
  slot:        { type: String, required: true }, // "10:00", "11:00" etc
  status:      { type: String, enum: ["pending", "confirmed", "cancelled", "completed"], default: "pending" },
  note:        { type: String, get: decrypt, set: encrypt }, // encrypted user's reason for booking
  cancelReason:{ type: String, get: decrypt, set: encrypt }, // encrypted
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// prevent double booking same slot
appointmentSchema.index({ resourceId: 1, date: 1, slot: 1 }, { unique: true });

export default mongoose.model("Appointment", appointmentSchema);