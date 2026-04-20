import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  }
};