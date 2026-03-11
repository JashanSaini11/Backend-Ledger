import express, { Express, Request, Response } from "express";
import Authrouter from "./routes/auth.routes";
import accountRouter from "./routes/account.route";
import cookieParser from "cookie-parser";
import transactionRouter from "./routes/transaction.route";

const app: Express = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

/**
 * - Routes
 */
app.use("/api/auth", Authrouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRouter);

app.get("/", (req: Request, res: Response) => {
  res.send("Backend running 🚀");
});

export default app;
