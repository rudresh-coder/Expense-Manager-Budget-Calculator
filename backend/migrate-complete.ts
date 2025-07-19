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

        // Step 1: Handle top-level transactions migration
        if (Array.isArray((doc as any).transactions) && (doc as any).transactions.length > 0) {
            const topLevelTransactions = (doc as any).transactions;
            console.log(`Found ${topLevelTransactions.length} top-level transactions in document ${doc._id}`);

            // Move each transaction to the correct account
            for (const tx of topLevelTransactions) {
                if (!(tx as any).accountId) {
                    console.warn(`Transaction ${tx.id} has no accountId, skipping`);
                    continue;
                }

                const account = doc.accounts.find((acc: any) => acc.id === tx.accountId);
                if (account) {
                    if (!Array.isArray(account.transactions)) {
                        account.transactions = new mongoose.Types.DocumentArray([]);
                    }
                    account.transactions.push(tx);
                    changed = true;
                    console.log(`Moved transaction ${tx.id} to account ${account.name}`);
                } else {
                    console.warn(`Account with id ${tx.accountId} not found for transaction ${tx.id}`);
                }
            }

            // Remove the top-level transactions array
            (doc as any).transactions = undefined;
            changed = true;
            console.log(`Removed top-level transactions array from document ${doc._id}`);
        }

        // Step 2: Ensure account structure and data integrity
        for (const account of doc.accounts) {
            // Ensure account has an id
            if (!account.id) {
                account.id = account._id?.toString() || Math.random().toString(36).slice(2);
                changed = true;
                console.log(`Added id ${account.id} to account ${account.name}`);
            }

            // Ensure transactions array exists and is properly formatted
            if (!account.transactions || !Array.isArray(account.transactions)) {
                account.transactions = new mongoose.Types.DocumentArray([]);
                changed = true;
                console.log(`Initialized transactions array for account ${account.name}`);
            }

            // Ensure every transaction has required fields
            for (const tx of account.transactions) {
                let txChanged = false;

                // Ensure transaction has an id
                if (!tx.id) {
                    tx.id = tx._id?.toString() || Math.random().toString(36).slice(2);
                    txChanged = true;
                }

                // Ensure transaction has accountId
                if (!(tx as any).accountId) {
                    (tx as any).accountId = account.id;
                    txChanged = true;
                }

                // Ensure transaction has source field
                if (!tx.source) {
                    tx.source = "manual";
                    txChanged = true;
                }

                if (txChanged) {
                    changed = true;
                    console.log(`Updated transaction ${tx.id} in account ${account.name}`);
                }
            }

            // Ensure splits array exists
            if (!Array.isArray(account.splits)) {
                account.splits = new mongoose.Types.DocumentArray([]);
                changed = true;
                console.log(`Initialized splits array for account ${account.name}`);
            }

            // Ensure every split has an id
            for (const split of account.splits) {
                if (!split.id) {
                    split.id = split._id?.toString() || Math.random().toString(36).slice(2);
                    changed = true;
                    console.log(`Added id ${split.id} to split ${split.name} in account ${account.name}`);
                }
            }
        }

        // Step 3: Remove any duplicate transactions (by id)
        for (const account of doc.accounts) {
            if (account.transactions && account.transactions.length > 0) {
                const uniqueTransactions = [];
                const seenIds = new Set();
                
                for (const tx of account.transactions) {
                    if (!seenIds.has(tx.id)) {
                        seenIds.add(tx.id);
                        uniqueTransactions.push(tx);
                    } else {
                        console.log(`Removed duplicate transaction ${tx.id} from account ${account.name}`);
                        changed = true;
                    }
                }
                
                if (uniqueTransactions.length !== account.transactions.length) {
                    account.transactions = new mongoose.Types.DocumentArray(uniqueTransactions);
                    changed = true;
                }
            }
        }

        if (changed) {
            await doc.save();
            updateCount++;
            console.log(` Successfully migrated document ${doc._id}`);
        }
    }

    console.log(`Migration complete. Updated ${updateCount} documents.`);
    mongoose.disconnect();
}

migrate().catch(err => {
    console.error("Migration error:", err);
    mongoose.disconnect();
});