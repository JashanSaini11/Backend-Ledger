import express from 'express';
import authMiddleware from '../middleware/auth.middleware';
import { accountController } from '../controllers/account.controller';
import { AccountModel } from '../models/account.model';



const accountRouter = express.Router();


/**
 * - POST /api/account 
 * - Create a new account
 * - Protected route, requires authentication
 * */ 


accountRouter.post("/", authMiddleware, accountController.createAccountController
)

/**
 * - GET /api/account
 * - Get all accounts for the authenticated user
 * - Protected route, requires authentication
 */

accountRouter.get("/", authMiddleware, accountController.getAccountsController
)

/**
 * - GET /api/accounts/balance/:accountId
 * - Get the balance of a specific account
 * - Protected route, requires authentication
 */
accountRouter.get("/balance/:accountId", authMiddleware, accountController.getAccountBalanceController
)




export default accountRouter;