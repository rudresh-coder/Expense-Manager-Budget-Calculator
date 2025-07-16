import mongoose from "mongoose";

const splitSchema = new mongoose.Schema({
    name: String,
    balance: Number,
});

const transactionSchema = new mongoose.Schema({
    id: { type: String },
    splitId: { type: String },
    type: { type: String, enum: ["add", "spend"] },
    amount: Number,
    description: String,
    date: Date,
    source: { type: String, enum: ["manual", "bank"], default: "manual" },
    bankName: { type: String },
});

const expenseManagerDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    accounts: [{
        name: String,
        balance: Number,
        splits: [splitSchema],
    }],
    transactions: [transactionSchema],
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("ExpenseManagerData", expenseManagerDataSchema);