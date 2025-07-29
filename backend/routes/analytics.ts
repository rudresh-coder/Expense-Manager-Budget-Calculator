import express from "express";
import ExpenseManagerData from "../models/ExpenseManagerData";
import { auth } from "../middleware/auth";
import { checkPremium } from "../middleware/checkPremium";
const router = express.Router();

router.get("/spending-trends", auth, checkPremium, async (req, res): Promise<void> => {
  const { accountId, month } = req.query; // Add month parameter
  if (!req.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const data = await ExpenseManagerData.findOne({ userId: req.user.id });
  const trends: Record<string, number> = {};
  const availableMonths: string[] = [];

  if (data && data.accounts) {
    const accounts = accountId
      ? data.accounts.filter(acc => acc.id === accountId)
      : data.accounts;
    
    // Collect all available months
    const monthsSet = new Set<string>();
    
    accounts.forEach(account => {
      account.transactions.forEach(tx => {
        if (tx.type === "spend" && tx.date) {
          const txMonth = new Date(tx.date).toISOString().slice(0, 7); // YYYY-MM format
          monthsSet.add(txMonth);
          
          // If month filter is specified, only include transactions from that month
          if (!month || txMonth === month) {
            const splitName =
              tx.splitId
                ? account.splits.find(s => s.id === tx.splitId)?.name || "Other"
                : "Main";
            trends[splitName] = (trends[splitName] || 0) + (tx.amount ?? 0);
          }
        }
      });
    });

    availableMonths.push(...Array.from(monthsSet).sort().reverse()); // Latest months first
  }

  res.json({ trends, availableMonths });
});

router.get("/income-expense", auth, checkPremium, async (req, res): Promise<void> => {
  const { accountId } = req.query;
  if (!req.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const data = await ExpenseManagerData.findOne({ userId: req.user.id });
  const monthly: Record<string, { income: number; expense: number }> = {};
  if (data && data.accounts) {
    const accounts = accountId
      ? data.accounts.filter(acc => acc.id === accountId)
      : data.accounts;
    accounts.forEach(account => {
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