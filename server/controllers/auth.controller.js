import bcrypt    from "bcryptjs";
import jwt       from "jsonwebtoken";
import crypto    from "crypto";
import User      from "../models/User.model.js";
import { sendVerificationEmail } from "../utils/mailer.js";

const signAccess   = (id) => jwt.sign({ id }, process.env.JWT_ACCESS_SECRET,  { expiresIn: "15m" });
const signRefresh  = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d"  });

const setRefreshCookie = (res, token) => res.cookie("refreshToken", token, {
  httpOnly: true, secure: process.env.NODE_ENV === "production",
  sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000,
});

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 12);
    const verifyToken  = crypto.randomBytes(32).toString("hex");
    const user = await User.create({ name, email, passwordHash, verifyToken });

    await sendVerificationEmail(email, verifyToken);
    res.status(201).json({ message: "Registered! Check your email to verify." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({ verifyToken: req.params.token });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    user.isVerified  = true;
    user.verifyToken = undefined;
    await user.save();
    res.json({ message: "Email verified! You can now log in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email first" });

    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);
    user.refreshToken  = refreshToken;
    await user.save();
    setRefreshCookie(res, refreshToken);

    res.json({
      accessToken,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user    = await User.findById(decoded.id);
    if (!user || user.refreshToken !== token)
      return res.status(401).json({ message: "Invalid refresh token" });

    const accessToken  = signAccess(user._id);
    const refreshToken = signRefresh(user._id);
    user.refreshToken  = refreshToken;
    await user.save();
    setRefreshCookie(res, refreshToken);
    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: "Token expired, please log in again" });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      const user = await User.findOne({ refreshToken: token });
      if (user) { user.refreshToken = undefined; await user.save(); }
    }
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};