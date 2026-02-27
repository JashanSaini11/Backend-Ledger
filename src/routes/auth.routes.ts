import express from 'express';
import { userLoginController, userRegisteredController } from '../controllers/auth.controller';


const router = express.Router();

console.log("Auth routes loaded");
/* POST /api/auth/register */
router.post("/register", userRegisteredController)

/* POST /api/auth/login */
router.post("/login", userLoginController)

export default router;