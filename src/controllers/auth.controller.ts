import { User } from "../models/user.model";
import * as jwt from "jsonwebtoken";
import {emailService} from "../services/email.service";

/** 
   - user resgistered controller
   - POST /api/auth/register
*/

async function userRegisteredController(req: any, res: any) {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const isExist = await User.findOne({ email });
  if (isExist) {
    return res
      .status(422)
      .json({ message: "Email already exists", status: "failed" });
  }

  const user = await User.create({
    email,
    name,
    password,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
  res.cookie("token", token, { httpOnly: true, secure: false });

  // Send email before responding (but don't block if it fails)
  try {
    await emailService.sendRegistrationEmail(user.email, user.name);
  } catch (err) {
    console.error("Registration email failed:", err);
    // Continue with registration even if email fails
  }

  res
    .status(201)
    .json({ user: { _id: user._id, email: user.email, name: user.name } });
}

/** 
   - user login controller
   - POST /api/auth/login
*/

async function userLoginController (req: any,res: any) {
  const {email,password} = req.body;

  if(!email || !password){
    return res.status(400).json({message:"Email and password are required"})
  }

  const user = await User.findOne({ email }).select("+password");

  if(!user){
    return res.status(401).json({message:"Invalid email please try again"})
  }

  const isMatch = await user.comparePassword(password);

  if(!isMatch){
    return res.status(401).json({message:"Invalid password please try again"})
  }

  const token =  jwt.sign({id: user._id}, process.env.JWT_SECRET as string, {expiresIn:"7d"});
  res.cookie("token", token, { httpOnly: true, secure: false });
  res.status(200).json({user:{_id: user._id, email: user.email, name: user.name}})
}

export { userRegisteredController, userLoginController };
