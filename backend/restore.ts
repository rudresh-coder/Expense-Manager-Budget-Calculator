import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import { execSync } from "child_process";
import ExpenseManagerData from "./models/ExpenseManagerData";

dotenv.config();

function isValidAccount(account: any): boolean {
  return (
    typeof account.id === "string" &&
    typeof account.name === "string" &&
    typeof account.balance === "number" &&
    Array.isArray(account.splits) &&
    Array.isArray(account.transactions)
  );
}

function isValidSplit(split: any): boolean {
  return (
    typeof split.id === "string" &&
    typeof split.name === "string" &&
    typeof split.balance === "number"
  );
}

function isValidTransaction(tx: any): boolean {
  return (
    typeof tx.id === "string" &&
    typeof tx.type === "string" &&
    typeof tx.amount === "number" &&
    (typeof tx.date === "string" || tx.date instanceof Date)
  );
}

// duplicate ID checks
function hasDuplicates(arr: any[], key: string) {
  const seen = new Set();
  for (const item of arr) {
    if (seen.has(item[key])) return true;
    seen.add(item[key]);
  }
  return false;
}

async function restore(backupFile: string) {
  // Backup current data before restoring
  try {
    execSync("npm run backup", { stdio: "inherit" }); 
    console.log("Current data backed up before restore.");
  } catch (err) {
    console.error("Failed to backup current data. Aborting restore for safety.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI!);
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }

  const backupData = JSON.parse(fs.readFileSync(backupFile, "utf-8"));

  for (const doc of backupData) {
    const { _id, ...docWithoutId } = doc;

    // Validate top-level fields
    if (!Array.isArray(doc.accounts) || doc.accounts.length === 0) {
      console.error(`No accounts found for userId: ${doc.userId}, skipping.`);
      continue;
    }

    if (
      typeof doc.userId !== "string" ||
      !Array.isArray(doc.accounts) ||
      !doc.accounts.every(isValidAccount) ||
      hasDuplicates(doc.accounts, "id")
    ) {
      console.error(`Invalid or duplicate account in document for userId: ${doc.userId}, skipping.`);
      continue;
    }

    // Validate splits and transactions in each account
    let valid = true;
    for (const account of doc.accounts) {
      if (
        !account.splits.every(isValidSplit) ||
        !account.transactions.every(isValidTransaction) ||
        hasDuplicates(account.splits, "id") ||
        hasDuplicates(account.transactions, "id")
      ) {
        console.error(
          `Invalid or duplicate splits/transactions in account ${account.id} for userId: ${doc.userId}, skipping.`
        );
        valid = false;
        break;
      }
    }
    if (!valid) continue;

    try {
      await ExpenseManagerData.findOneAndUpdate(
        { userId: doc.userId },
        docWithoutId,
        { upsert: true }
      );
    } catch (err: any) {
      console.error(`Failed to restore userId: ${doc.userId}, doc _id: ${doc._id}: ${err.message}`);
    }
  }
  console.log("Restore complete.");

  await mongoose.disconnect();
}

const file = process.argv[2];
if (!file) {
  console.error("Please provide a backup file path.");
  process.exit(1);
}
restore(file).catch(err => {
  console.error("Restore error:", err);
  process.exit(1);
});