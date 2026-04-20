import Resource from "../models/Resource.model.js";
import User     from "../models/User.model.js";
import Report   from "../models/Report.model.js";

export const getStats = async (req, res) => {
  try {
    const [totalResources, pendingCount, totalUsers, openReports] = await Promise.all([
      Resource.countDocuments({ isVerified: true }),
      Resource.countDocuments({ isVerified: false }),
      User.countDocuments(),
      Report.countDocuments({ status: "open" }),
    ]);
    res.json({ totalResources, pendingCount, totalUsers, openReports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPendingResources = async (req, res) => {
  try {
    const resources = await Resource.find({ isVerified: false }).populate("addedBy", "name email");
    res.json({ resources });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const approveResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id, { isVerified: true }, { new: true }
    );
    res.json({ resource });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const rejectResource = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: "Resource rejected and removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ status: "open" })
      .populate("resourceId", "name type address")
      .populate("userId", "name");
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resolveReport = async (req, res) => {
  try {
    await Report.findByIdAndUpdate(req.params.id, { status: "resolved" });
    res.json({ message: "Report resolved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};