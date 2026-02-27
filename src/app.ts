import express, { Express, Request, Response } from "express";
import router from "./routes/auth.routes";
import cookieParser from "cookie-parser";

const app: Express = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", router);

// console.log("Auth router mounted at /api/auth");

app.get("/", (req: Request, res: Response) => {
  res.send("Backend running 🚀");
});

export default app;
