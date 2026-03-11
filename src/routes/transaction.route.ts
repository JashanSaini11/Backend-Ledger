import express from 'express'; 
import authMiddleware, { systemAuthMiddleware } from '../middleware/auth.middleware';
import { transactionController } from '../controllers/transaction.controller';

const transactionRouter = express.Router();

/**
 * - POST /api/transactions/
 * - Create a new transaction
 */

transactionRouter.post("/", authMiddleware, transactionController.createTransaction);

/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds for a user (System User Only)
 */

transactionRouter.post("/system/initial-funds", systemAuthMiddleware, transactionController.createInitialFunds);


export default transactionRouter;