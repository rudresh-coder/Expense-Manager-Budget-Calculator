import User from "../models/User";
import { Request, Response, NextFunction } from "express";

export async function adminAuth(req: Request, res: Response, next: NextFunction) {
    const user = await User.findById(req.user?.id);
    if(!user || !user.isAdmin) {
        res.status(403).json({ error: "Admin access required"});
        return;
    }
    next();
}