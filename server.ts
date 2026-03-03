import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";
import { connectDB } from "./src/config/db";

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
