import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isPremium: { type: Boolean, default: false },
    trialExpiresAt: { type: Date, default: null },
    avatarUrl: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    bankLinks: [
        {
            accountId: String,
            bankName: String,
            accessToken: String,
            paid: { type: Boolean, default: false }, // true if user paid ₹35 for this link
            linkedAt: Date,
        }
    ],
}, { timestamps: true });

export default mongoose.model("User", userSchema);