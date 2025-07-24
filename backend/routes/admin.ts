import express from "express";
import { adminAuth } from "../middleware/adminAuth";
import User from "../models/User";
const router = express.Router();

//List users
router.get("/users", adminAuth, async (req, res) => {
    const users = await User.find({}, "fullName email isPremium isAdmin createdAt");
    res.json(users);
});

//Update premium status
router.patch("/users/:id/premium", adminAuth, async (req, res) => {
    const { isPremium } = req.body;
    await User.findByIdAndUpdate(req.params.id, { isPremium });
    res.json({ success: true });
});

//Delete user
router.delete("/users/:id", adminAuth, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
});

//Analytics with monthly user growth
router.get("/analytics", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const premiumUsers = await User.countDocuments({ isPremium: true });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Monthly user growth
    const monthlyGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 }
    ]);

    // Premium vs Free user growth
    const premiumGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            isPremium: "$isPremium"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const labels = monthlyGrowth.map(item => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                         "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return monthNames[item._id.month - 1];
    });

    res.json({ 
      totalUsers, 
      premiumUsers,
      newUsersThisMonth,
      userGrowth: {
        labels,
        data: monthlyGrowth.map(item => item.count)
      },
      premiumGrowth
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

export default router;