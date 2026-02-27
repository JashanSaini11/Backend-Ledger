import dotenv from "dotenv";
import app from "./src/app";
import { connectDB } from "./src/config/db";

dotenv.config();

const PORT = process.env.PORT;



const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
