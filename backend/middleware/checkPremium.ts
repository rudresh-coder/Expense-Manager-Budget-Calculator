import User from "../models/User";
import { Request, Response, NextFunction } from "express";

export async function checkPremium(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await User.findById(userId);
  if (!user || !user.isPremium) {
    res.status(403).json({ error: "Premium access required" });
    return;
  }
  next();
}