import crypto from "crypto";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendResetEmail } from "./utils/sendMail";
import { passwordResetLimiter } from "./middleware/rateLimiter";

import User from "./models/User";
import ExpenseManagerData from "./models/ExpenseManagerData";
import PasswordResetToken from "./models/PasswordResetToken";
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
      res.json({
        token,
        isPremium: user.isPremium,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl || "", 
        trialExpiresAt: user.trialExpiresAt
      });
    } catch (err) {
      res.status(500).json({ error: "Login failed" });
    }
  });

//Request password reset
app.post("/api/auth/forgot-password", passwordResetLimiter, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: "Email is required." });
    return;
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(200).json({ message: "If this email exists, a reset link has been sent." });
    return;
  }
  const token = crypto.randomBytes(32).toString("hex");
  await PasswordResetToken.deleteMany({ email }); // Remove old tokens for this email
  await PasswordResetToken.create({
    email,
    token,
    expires: new Date(Date.now() + 1000 * 60 * 15), // 15 min expiry
  });

  try {
    await sendResetEmail(user.email, token);
    res.json({ message: "Password reset link sent." });
  } catch (err) {
    res.status(500).json({ error: "Failed to send password reset email. Please try again later." });
  }
});

// Reset password
app.post("/api/auth/reset-password", passwordResetLimiter, async (req, res) => {
  const { email, token, newPassword } = req.body;
  if (!email || !token || !newPassword) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }
  const record = await PasswordResetToken.findOne({ email, token });
  if (!record || record.expires.getTime() < Date.now()) {
    res.status(400).json({ error: "Invalid or expired token." });
    return;
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({ error: "User not found." });
    return;
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  await PasswordResetToken.deleteMany({ email }); // Remove used tokens
  res.json({ message: "Password has been reset." });
});

//Get expense data (premium only)
app.get("/api/expense", auth, checkPremium, async (req, res) => {
  try {
    const { accounts } = req.body;
    const data = await ExpenseManagerData.findOne({ userId: req.user?.id });

    if (data && data.accounts) {
      const existingData = data; // Assign data to existingData for clarity
      for (let i = 0; i < accounts.length; i++) {
        const newAccount = accounts[i];
        const existingAccount = existingData.accounts.find(acc => acc.id === newAccount.id);
        
        if (existingAccount && 
            existingAccount.transactions && 
            existingAccount.transactions.length > 0 && 
            (!newAccount.transactions || newAccount.transactions.length === 0)) {
          
          console.warn(`Preventing transaction data loss for account ${newAccount.name}`);
          // Keep existing transactions instead of overwriting with empty array
          newAccount.transactions = existingAccount.transactions;
        }
      }
    }

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
    
    // Get existing data first
    const existingData = await ExpenseManagerData.findOne({ userId: req.user?.id });
    
    // If we're about to save empty transactions but existing data has transactions, prevent it
    if (existingData && existingData.accounts) {
      for (let i = 0; i < accounts.length; i++) {
        const newAccount = accounts[i];
        const existingAccount = existingData.accounts.find(acc => acc.id === newAccount.id);
        
        if (existingAccount && 
            existingAccount.transactions && 
            existingAccount.transactions.length > 0 && 
            (!newAccount.transactions || newAccount.transactions.length === 0)) {
          
          console.warn(`Preventing transaction data loss for account ${newAccount.name}`);
          // Keep existing transactions instead of overwriting with empty array
          newAccount.transactions = existingAccount.transactions;
        }
      }
    }

    // Validate accounts is an array
    if (!Array.isArray(accounts)) {
      res.status(400).json({ error: "Accounts must be an array." });
      return; 
    }

    // Check for duplicate account IDs and names
    const accountIds = new Set();
    const accountNames = new Set();
    for (const account of accounts) {
      if (accountIds.has(account.id)) {
        res.status(400).json({ error: `Duplicate account id found: ${account.id}` });
        return;
      }
      if (accountNames.has(account.name)) {
        res.status(400).json({ error: `Duplicate account name found: ${account.name}` });
        return;
      }
      accountIds.add(account.id);
      accountNames.add(account.name);
    }

    // Validate each account
    for (const account of accounts) {
      if (typeof account.name !== "string" || typeof account.balance !== "number") {
        res.status(400).json({ error: "Invalid account data." });
        return;
      }
      if (!Array.isArray(account.splits) || !Array.isArray(account.transactions)) {
        res.status(400).json({ error: "Splits and transactions must be arrays." });
        return;
      }
      // Validate splits
      for (const split of account.splits) {
        if (typeof split.name !== "string" || typeof split.balance !== "number") {
          res.status(400).json({ error: "Invalid split data." });
          return;
        }
      }
      // Validate transactions
      for (const tx of account.transactions) {
        if (
          typeof tx.id !== "string" ||
          typeof tx.type !== "string" ||
          typeof tx.amount !== "number" ||
          typeof tx.date !== "string"
        ) {
          res.status(400).json({ error: "Invalid transaction data." });
          return;
        }
      }
    }

    // Proceed with saving
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

// Get user profile
app.get("/api/user/profile", auth, async (req, res) => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({
    fullName: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl || "",
    isPremium: user.isPremium,
    trialExpiresAt: user.trialExpiresAt
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));