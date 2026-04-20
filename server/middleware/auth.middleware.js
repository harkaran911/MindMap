import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Not authorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = await User.findById(decoded.id).select("-passwordHash");
    if (!req.user) return res.status(401).json({ message: "User not found" });
    next();
  } catch {
    res.status(401).json({ message: "Token invalid or expired" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Admins only" });
  next();
};