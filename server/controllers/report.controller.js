import Report from "../models/Report.model.js";

export const createReport = async (req, res) => {
  try {
    const { resourceId, reason } = req.body;
    const existing = await Report.findOne({ resourceId, userId: req.user._id, status: "open" });
    if (existing) return res.status(400).json({ message: "Already reported" });
    const report = await Report.create({ resourceId, userId: req.user._id, reason });
    res.status(201).json({ report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};