import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isPremium: { type: Boolean, default: false },
    trialExpiresAt: { type: Date, default: null },
    storageExpiry: { type: Date, default: null },
    isAdmin: { type: Boolean, default: false },
    avatarUrl: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    premiumMonths: { type: [String], default: [] },
    premiumHistory: { type: [{ start: Date, end: Date }], default: [] },
}, { timestamps: true });

export default mongoose.model("User", userSchema);