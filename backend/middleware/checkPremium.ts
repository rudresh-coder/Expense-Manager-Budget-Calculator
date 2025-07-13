import User from "../models/User";
import { Request, Response, NextFunction } from "express";

export async function checkPremium(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await User.findById(userId);
  const now = new Date();
  const trialActive = user?.trialExpiresAt && now < user.trialExpiresAt;
  if (!user || !user.isPremium && !trialActive) {
    res.status(403).json({ error: "Premium access required" });
    return;
  }
  if (user.isPremium && user.trialExpiresAt && now > user.trialExpiresAt) {
    user.isPremium = false;
    await user.save();
  }
  next();
}