import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  type:       { type: String, enum: ["therapist","hotline","hospital","ngo","online"], required: true },
  address:    { type: String, required: true },
  phone:      String,
  website:    String,
  description: String,
  languages:  [String],
  tags:       [String],
  location: {
    type:        { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  isVerified: { type: Boolean, default: false },
  addedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  avgRating:  { type: Number, default: 0 },
  insuranceAccepted: [String],
  costPerSession: Number,
  isFree: { type: Boolean, default: false },
}, { timestamps: true });

resourceSchema.index({ location: "2dsphere" });
resourceSchema.index({ name: "text", description: "text", tags: "text" });

export default mongoose.model("Resource", resourceSchema);