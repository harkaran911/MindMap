import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: "Resource", required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User",     required: true },
  reason:     { type: String, required: true },
  status:     { type: String, enum: ["open", "resolved"], default: "open" },
}, { timestamps: true });

export default mongoose.model("Report", reportSchema);