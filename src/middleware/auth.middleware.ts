import { UserModel } from "../models/user.model";
import * as jwt from "jsonwebtoken";

export async function authMiddleware(req: any, res: any, next: any) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized, user not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized, invalid token" });
  }
}

export async function systemAuthMiddleware(req: any, res: any, next: any) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const user = await UserModel.findById(decoded.id).select("+systemUser");

    if (!user || !user.systemUser) {
      return res
        .status(403)
        .json({ message: "Forbidden, system user access required" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized, invalid token" });
  }
}

export default authMiddleware;
