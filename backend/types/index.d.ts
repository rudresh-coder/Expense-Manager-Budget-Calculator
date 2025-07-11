import "express";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; isPremium: boolean };
    }
  }
}