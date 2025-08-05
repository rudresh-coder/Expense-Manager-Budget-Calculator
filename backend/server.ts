import crypto from "crypto";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import cron from "node-cron";
import adminRoutes from "./routes/admin";
import rateLimit from "express-rate-limit";
import winston from "winston";
import { sendResetEmail, sendVerificationEmail } from "./utils/sendMail";
import { passwordResetLimiter } from "./middleware/rateLimiter";
import User from "./models/User";
import ExpenseManagerData from "./models/ExpenseManagerData";
import PasswordResetToken from "./models/PasswordResetToken";
import { checkPremium } from "./middleware/checkPremium";
import { createServer } from 'http';
import { Server } from 'socket.io';
import analyticsRoutes from "./routes/analytics";
import xss from "xss-clean";

dotenv.config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" })
  ]
});

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  }
});

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(`user-${userId}`);
  });
});

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://apis.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'self'"],
      upgradeInsecureRequests: [],
    },
  })
);

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Only allow your frontend
  credentials: true
}));

app.use(express.json());
app.use(xss());

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: { error: "Too many requests, please try again later." }
});


//MongoDB connection
if (!process.env.MONGO_URI) {
    logger.error("MongoDB connection string is not defined in environment variables.");
    process.exit(1); 
}

if (!process.env.FRONTEND_URL) {
  logger.error("FRONTEND_URL is not defined in environment variables.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => logger.info("MongoDB connected"))
    .catch(err => logger.error("MongoDB connection error:", err));

if (!process.env.JWT_SECRET) {
    logger.error("JWT secret is not defined in environment variables.");
    process.exit(1);
}
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.error("SMTP credentials are not defined in environment variables.");
    process.exit(1);
}

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

function isStrongPassword(password: string): boolean {
  // At least 8 chars, one uppercase, one lowercase, one number, one special char
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
}

// Register
app.post("/api/auth/signup", async (req: express.Request, res: express.Response) => {
    try {
      const { fullName, email, password } = req.body;
      const verificationToken = crypto.randomBytes(32).toString("hex");
  
      // Validate required fields
      if (!fullName || !email || !password) {
        res.status(400).json({ error: "All fields are required." });
        return;
      }

      if (!isStrongPassword(password)) {
        res.status(400).json({
          error:
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
        });
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
        isPremium: false,
        trialExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isVerified: false,
        verificationToken,
      });
  
      await user.save();
      logger.info(`User registered: ${email}`);

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
      await sendVerificationEmail(email, verificationUrl);
  
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
      if (!user.isVerified) {
        res.status(403).json({ error: "Please verify your email before logging in." });
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
      logger.info(`User login: ${email}`);
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
  if (!isStrongPassword(newPassword)) {
    res.status(400).json({
      error:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    });
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
  logger.info(`Password reset for: ${email}`);
  res.json({ message: "Password has been reset." });
});

// Email verification
app.get("/api/auth/verify-email", async (req: express.Request, res: express.Response) => {
  const { token, email } = req.query;
  if (!token || !email) {
     res.status(400).json({ error: "Invalid verification link." });
     return
  }
  const user = await User.findOne({ email, verificationToken: token });
  if (!user) {
     res.status(400).json({ error: "Invalid or expired verification link." });
     return
  }
  user.isVerified = true;
  user.verificationToken = "";
  await user.save();
  logger.info(`Email verified: ${email}`);
  res.json({ message: "Email verified successfully. You can now log in." });
});

//Get expense data (premium only)
app.get("/api/expense", auth, checkPremium, async (req, res) => {
  try {
    const data = await ExpenseManagerData.findOne({ userId: req.user?.id });

    if (!data) {
      res.json({ hasData: false, accounts: [] });
    } else {
      // Only ensure transactions is always an array for each account
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
    logger.error("Fetch expense data error:", err);
    res.status(500).json({ error: "Failed to fetch expense data" });
  }
});

//Save/Update expense data
app.post("/api/expense", auth, async (req, res) => {
  try {
    const { accounts } = req.body;
    if (!Array.isArray(accounts)) {
      res.status(400).json({ error: "Accounts must be an array." });
      return;
    }
    
    // Validation (keep existing validation code)
    for (const acc of accounts) {
      if (typeof acc.name !== "string" || acc.name.length > 100) {
        res.status(400).json({ error: "Invalid account name." });
        return;
      }
      if (typeof acc.balance !== "number" || isNaN(acc.balance)) {
        res.status(400).json({ error: "Invalid account balance." });
        return;
      }
      if (!Array.isArray(acc.splits) || !Array.isArray(acc.transactions)) {
        res.status(400).json({ error: "Splits and transactions must be arrays." });
        return;
      }
      for (const split of acc.splits) {
        if (typeof split.name !== "string" || split.name.length > 50) {
          res.status(400).json({ error: "Invalid split name." });
          return;
        }
        if (typeof split.balance !== "number" || isNaN(split.balance)) {
          res.status(400).json({ error: "Invalid split balance." });
          return;
        }
      }
      for (const tx of acc.transactions) {
        if (
          typeof tx.id !== "string" ||
          typeof tx.type !== "string" ||
          typeof tx.amount !== "number" ||
          typeof tx.date !== "string" ||
          typeof tx.description !== "string"
        ) {
          res.status(400).json({ error: "Invalid transaction data." });
          return;
        }
        if (tx.description.length > 200) {
          res.status(400).json({ error: "Description too long." });
          return;
        }
      }
    }

    // **ADD THIS: ACTUAL SAVE LOGIC**
    let existingData = await ExpenseManagerData.findOne({ userId: req.user?.id });
    const savedAccountIds: string[] = [];
    const savedTransactionIds: string[] = [];

    if (!existingData) {
      // Create new document
      existingData = new ExpenseManagerData({
        userId: req.user?.id,
        accounts: accounts,
      });
      await existingData.save();
      
      // Mark all accounts and transactions as saved
      for (const acc of accounts) {
        savedAccountIds.push(acc.id);
        if (acc.transactions) {
          for (const tx of acc.transactions) {
            savedTransactionIds.push(tx.id);
          }
        }
      }
    } else {
      // Merge with existing data using modifiedAt for conflict resolution
      for (const newAccount of accounts) {
        const existingAccountIndex = existingData.accounts.findIndex(acc => acc.id === newAccount.id);
        
        if (existingAccountIndex === -1) {
          // New account
          existingData.accounts.push(newAccount);
          savedAccountIds.push(newAccount.id);
          if (newAccount.transactions) {
            for (const tx of newAccount.transactions) {
              savedTransactionIds.push(tx.id);
            }
          }
        } else {
          // Existing account - use modifiedAt for "last write wins"
          const existingAccount = existingData.accounts[existingAccountIndex];
          
          if (
            !existingAccount.modifiedAt ||
            !newAccount.modifiedAt ||
            new Date(newAccount.modifiedAt) > new Date(existingAccount.modifiedAt)
          ) {
            existingAccount.name = newAccount.name;
            existingAccount.balance = newAccount.balance;
            existingAccount.splits = newAccount.splits;
            existingAccount.modifiedAt = newAccount.modifiedAt;
            savedAccountIds.push(newAccount.id);
          }

          // Merge transactions by id, using last write wins
          const txMap = new Map<string, any>();
          for (const tx of existingAccount.transactions) {
            txMap.set(tx.id, tx);
          }
          for (const tx of newAccount.transactions) {
            const existingTx = txMap.get(tx.id);
            if (
              !existingTx ||
              !existingTx.modifiedAt ||
              !tx.modifiedAt ||
              new Date(tx.modifiedAt) > new Date(existingTx.modifiedAt)
            ) {
              txMap.set(tx.id, tx);
              savedTransactionIds.push(tx.id);
            }
          }
          existingAccount.transactions.splice(
            0,
            existingAccount.transactions.length,
            ...Array.from(txMap.values())
          );
        }
      }
      await existingData.save();
    }

    // Emit socket update
    io.to(`user-${req.user?.id}`).emit("expenseDataUpdated", {
      accounts: existingData.accounts,
      updatedAt: existingData.updatedAt
    });

    res.status(200).json({ 
      message: "Expense data saved successfully.",
      savedAccountIds,
      savedTransactionIds
    });
  } catch (err) {
    console.error("Expense save error:", err);
    res.status(500).json({ error: "Failed to save expense data" });
  }
});

//Example: Upgrade to premium (demo)
app.post("/api/user/upgrade", auth, async (req: express.Request, res: express.Response) => {
    await User.findByIdAndUpdate(req.user?.id, { isPremium: true });
    logger.info(`User upgraded to premium: ${req.user?.id}`);
    res.json({ message: "Upgraded to premium" });
});

// Get user profile
app.get("/api/user/profile", auth, async (req, res) => {
  try {
    if (!req.user?.id) {
      logger.error("No user ID in request");
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      logger.error(`User not found: ${req.user.id}`);
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      avatarUrl: user.avatarUrl || "",
      isPremium: user.isPremium,
      trialExpiresAt: user.trialExpiresAt,
      isAdmin: user.isAdmin
    });
  } catch (err) {
    logger.error("Profile fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use("/api/admin", auth, adminRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/auth", generalLimiter);
app.use("/api/password-reset", generalLimiter);

cron.schedule("0 2 * * *", async () => {
  // Runs every day at 2 AM
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const freeUsers = await User.find({ isPremium: false });
  for (const user of freeUsers) {
    const data = await ExpenseManagerData.findOne({ userId: user._id });
    if (data && Array.isArray(data.accounts)) {
      let changed = false;
      for (const account of data.accounts) {
        if (Array.isArray(account.transactions)) {
          const originalLength = account.transactions.length;
          account.transactions = account.transactions.toObject().filter(
            (tx: { date: string }) => new Date(tx.date) > oneMonthAgo
          );
          if (account.transactions.length !== originalLength) changed = true;
        }
      }
      if (changed) await data.save();
    }
  }
  logger.info("Old transactions deleted for free users");
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => logger.info(`Server running on port ${PORT}`));