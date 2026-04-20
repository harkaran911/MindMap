import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
  rating:     { type: Number, min: 1, max: 5, required: true },
  comment:    { type: String, trim: true },
  isAnonymous:{ type: Boolean, default: false },
}, { timestamps: true });

reviewSchema.index({ resourceId: 1, userId: 1 }, { unique: true }); // one review per user per resource

export default mongoose.model("Review", reviewSchema);