import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURL = process.env.MONGO_URL;

    if (!mongoURL) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }

    await mongoose.connect(mongoURL);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};
