import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "./models/User";
import ExpenseManagerData from "./models/ExpenseManagerData";
import { checkPremium } from "./middleware/checkPremium";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

//MongoDB connection
if (!process.env.MONGO_URI) {
    console.error("MongoDB connection string is not defined in environment variables.");
    process.exit(1); 
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

const auth: express.RequestHandler = async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "No token" });
        return;
    }
    try {
        if (!process.env.JWT_SECRET) {
            res.status(500).json({ error: "JWT secret is not configured" });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded as { id: string; isPremium: boolean };
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}

// Register
app.post("/api/auth/signup", async (req: express.Request, res: express.Response) => {
    try {
      const { fullName, email, password } = req.body;
  
      // Validate required fields
      if (!fullName || !email || !password) {
        res.status(400).json({ error: "All fields are required." });
        return;
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({ error: "Email is already registered." });
        return;
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create user
      const user = new User({
        fullName,
        email,
        password: hashedPassword,
        isPremium: true,
        trialExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
  
      await user.save();
  
      res.status(201).json({ message: "User registered successfully." });
    } catch (err) {
      res.status(500).json({ error: "Signup failed." });
    }
  });
  
  // Login
  app.post("/api/auth/login", async (req: express.Request, res: express.Response) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ error: "Invalid credentials" });
        return;
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        res.status(400).json({ error: "Invalid credentials" });
        return;
      }
      const token = jwt.sign(
        { id: user._id, isPremium: user.isPremium },
        process.env.JWT_SECRET || "default_secret",
        { expiresIn: "7d" }
      );
      res.json({ token, isPremium: user.isPremium, fullName: user.fullName, trialExpiresAt: user.trialExpiresAt });
    } catch (err) {
      res.status(500).json({ error: "Login failed" });
    }
  });

//Get expense data (premium only)
app.get("/api/expense", auth, checkPremium, async (req, res) => {
  try {
    const data = await ExpenseManagerData.findOne({ userId: req.user?.id });

    if (!data) {
      res.json({ hasData: false, accounts: [] });
    } else {
      // Ensure every account has a transactions array
      const accounts = (data.accounts || []).map(acc => ({
        ...acc.toObject(),
        transactions: Array.isArray(acc.transactions) ? acc.transactions : [],
      }));

      res.json({
        hasData: true,
        accounts,
        _id: data._id,
        userId: data.userId,
        updatedAt: data.updatedAt
      });
    }
  } catch (err) {
    console.error("Fetch expense data error:", err);
    res.status(500).json({ error: "Failed to fetch expense data" });
  }
});

//Save/Update expense data (premium only)
app.post("/api/expense", auth, checkPremium, async (req, res) => {
  try {
      const { accounts } = req.body;
      
      console.log("Saving data for user:", req.user?.id, { accountsCount: accounts?.length });
      
      const filter = { userId: req.user?.id };
      const update = {
          accounts: accounts || [],
          updatedAt: new Date(),
      };
      const options = { upsert: true, new: true, setDefaultsOnInsert: true };

      const result = await ExpenseManagerData.findOneAndUpdate(filter, update, options);
      console.log("Save successful for user:", req.user?.id);

      res.json({ message: "Expense data saved", data: result });
  } catch (err) {
      console.error("Expense save error:", err);
      res.status(500).json({ error: "Failed to save expense data" });
  }
});

//Example: Upgrade to premium (demo)
app.post("/api/user/upgrade", auth, async (req: express.Request, res: express.Response) => {
    await User.findByIdAndUpdate(req.user?.id, { isPremium: true });
    res.json({ message: "Upgraded to premium" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));