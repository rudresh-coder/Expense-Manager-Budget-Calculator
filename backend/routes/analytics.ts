import express from "express";
import ExpenseManagerData from "../models/ExpenseManagerData";
import { auth } from "../middleware/auth";
import { checkPremium } from "../middleware/checkPremium";
const router = express.Router();

router.get("/spending-trends", auth, checkPremium, async (req, res): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const data = await ExpenseManagerData.findOne({ userId: req.user.id });
  const trends: Record<string, number> = {};
  if (data && data.accounts) {
    data.accounts.forEach(account => {
      account.transactions.forEach(tx => {
        if (tx.type === "spend") {
            const splitName =
            tx.splitId
              ? account.splits.find(s => s.id === tx.splitId)?.name || "Other"
              : "Main";
          trends[splitName] = (trends[splitName] || 0) + (tx.amount ?? 0);
        }
      });
    });
  }
  res.json(trends);
});

router.get("/income-expense", auth, checkPremium, async (req, res): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const data = await ExpenseManagerData.findOne({ userId: req.user.id });
  const monthly: Record<string, { income: number; expense: number }> = {};
  if (data && data.accounts) {
    data.accounts.forEach(account => {
      account.transactions.forEach(tx => {
        const month = tx.date && !isNaN(new Date(tx.date).getTime())
        ? new Date(tx.date).toISOString().slice(0, 7)
        : "Unknown";
        if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };
        if (tx.type === "add") monthly[month].income += tx.amount ?? 0;
        if (tx.type === "spend") monthly[month].expense += tx.amount ?? 0;
      });
    });
  }
  res.json(monthly);
});

export default router;