import express from 'express'; 
import authMiddleware from '../middleware/auth.middleware';

const transactionRouter = express.Router();

/**
 * - POST /api/transactions/
 * - Create a new transaction
 */

transactionRouter.post("/", authMiddleware,)