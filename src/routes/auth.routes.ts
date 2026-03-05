import express from 'express';
import { userLoginController, userRegisteredController } from '../controllers/auth.controller';


const Authrouter = express.Router();

console.log("Auth routes loaded");
/* POST /api/auth/register */
Authrouter.post("/register", userRegisteredController)

/* POST /api/auth/login */
Authrouter.post("/login", userLoginController)

export default Authrouter;