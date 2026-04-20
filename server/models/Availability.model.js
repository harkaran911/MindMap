import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true, unique: true },
  weeklySlots: {
    mon: [String], // ["09:00", "10:00", "11:00"]
    tue: [String],
    wed: [String],
    thu: [String],
    fri: [String],
    sat: [String],
    sun: [String],
  },
  slotDuration: { type: Number, default: 60 }, // minutes
  bookedSlots: [{
    date: String,  // "2026-04-10"
    slot: String,  // "10:00"
  }],
}, { timestamps: true });

export default mongoose.model("Availability", availabilitySchema);