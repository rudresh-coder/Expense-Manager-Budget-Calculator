import mongoose from "mongoose";
require("dotenv").config();

import ExpenseManagerData from "./models/ExpenseManagerData";

async function migrate() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in the environment variables.");
    }
    await mongoose.connect(process.env.MONGO_URI);

    const allDocs = await ExpenseManagerData.find({});
    let updateCount = 0;

    for (const doc of allDocs) {
        let changed = false;
        for (const account of doc.accounts) {
            // Ensure transactions array exists
            if (!account.transactions || typeof account.transactions !== "object" || !("isMongooseDocumentArray" in account.transactions)) {
                account.transactions = Array.isArray(account.transactions)
                    ? []
                    : account.transactions && typeof account.transactions === "object" && "constructor" in account.transactions
                        ? new (account.transactions as any).constructor()
                        : [];
                changed = true;
            }
            // Ensure every transaction has an id
            for (const tx of account.transactions) {
                if (!tx.id && tx._id) {
                    tx.id = tx._id.toString();
                    changed = true;
                }
            }
        }
        if (changed) {
            await doc.save();
            updateCount++;
            console.log(`Updated document ${doc._id}`);
        }
    }

    console.log(`Migration complete. Updated ${updateCount} documents.`);
    mongoose.disconnect();
}

migrate().catch(err => {
    console.log("Migration error:", err);
    mongoose.disconnect();
});