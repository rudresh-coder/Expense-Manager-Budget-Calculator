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

    // Only proceed if there is a top-level transactions array
    if (Array.isArray((doc as any).transactions) && (doc as any).transactions.length > 0) {
      const topLevelTransactions = (doc as any).transactions;

      // Move each transaction to the correct account
      for (const tx of topLevelTransactions) {
        if (!tx.accountId) continue; // skip if no accountId

        const account = doc.accounts.find((acc: any) => acc.id === tx.accountId);
        if (account) {
          if (!Array.isArray(account.transactions)) {
            account.transactions = account.transactions || [];
          }
          account.transactions.push(tx);
          changed = true;
        }
      }

      // Remove the top-level transactions array
      (doc as any).transactions = undefined;
      changed = true;
    }

    if (changed) {
      await doc.save();
      updateCount++;
      console.log(`Migrated document ${doc._id}`);
    }
  }

  console.log(`Migration complete. Updated ${updateCount} documents.`);
  mongoose.disconnect();
}

migrate().catch(err => {
  console.log("Migration error:", err);
  mongoose.disconnect();
});