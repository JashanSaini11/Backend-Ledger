import express from 'express';
import authMiddleware from '../middleware/auth.middleware';
import { accountController } from '../controllers/account.controller';



const accountRouter = express.Router();


/**
 * - POST /api/account 
 * - Create a new account
 * - Protected route, requires authentication
 * */ 


accountRouter.post("/", authMiddleware, accountController.createAccountController
)





export default accountRouter;