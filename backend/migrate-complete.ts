import mongoose from "mongoose";
import fs from "fs";
require("dotenv").config();

import ExpenseManagerData from "./models/ExpenseManagerData";

const DRY_RUN = process.env.DRY_RUN === 'true';
const BATCH_SIZE = 50;
const MAX_ERRORS = 5;

// Add more specific interfaces
interface TransactionDocument {
    id: string;
    accountId?: string;
    _id?: mongoose.Types.ObjectId;
    [key: string]: any;
}

interface AccountDocument {
    id?: string;
    _id?: mongoose.Types.ObjectId;
    name?: string | null | undefined;
    transactions: any[];
    splits: any[];
}

interface ExpenseDocument {
    _id: mongoose.Types.ObjectId;
    accounts: AccountDocument[];
    transactions?: TransactionDocument[];
    [key: string]: any;
}

async function migrate() {
    console.log("IMPORTANT: Ensure no users are actively using the application during migration");
    console.log("Consider running during maintenance window");

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not defined in the environment variables.");
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    
    // Create backup
    if (!DRY_RUN) {
        console.log("Creating backup...");
        const backupData = await ExpenseManagerData.find({}).lean();
        
        // Better backup location
        const backupDir = './backups';
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = `${backupDir}/backup-${timestamp}.json`;

        fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
        console.log(`Backup created: ${backupFile}`);
    }

    const totalDocs = await ExpenseManagerData.countDocuments({});
    let processed = 0;
    let updateCount = 0;
    let errorCount = 0;

    console.log(`Starting migration of ${totalDocs} documents (DRY_RUN: ${DRY_RUN})`);

    while (processed < totalDocs) {
        const docs = await ExpenseManagerData.find({})
            .skip(processed)
            .limit(BATCH_SIZE);

        for (const doc of docs) {
            try {
                let changed = false;
                const originalData = JSON.parse(JSON.stringify(doc.toObject()));

                // Step 1: Handle top-level transactions migration (SAFER VERSION)
                if (Array.isArray((doc as any).transactions) && (doc as any).transactions.length > 0) {
                    const topLevelTransactions = (doc as any).transactions;
                    console.log(`Found ${topLevelTransactions.length} top-level transactions in document ${doc._id}`);

                    let successfullyMoved = 0;
                    let failedToMove = 0;

                    // Move each transaction to the correct account
                    for (const tx of topLevelTransactions) {
                        if (!(tx as any).accountId) {
                            console.warn(`Transaction ${tx.id} has no accountId, skipping`);
                            failedToMove++;
                            continue;
                        }

                        const account = doc.accounts.find((acc: AccountDocument) => acc.id === tx.accountId);
                        if (account) {
                            if (!Array.isArray(account.transactions)) {
                                account.transactions = new mongoose.Types.DocumentArray([]);
                            }
                            
                            //  Check for duplicates before adding
                            const existsInAccount = account.transactions.some((existingTx: any) => existingTx.id === tx.id);
                            if (!existsInAccount) {
                                account.transactions.push(tx);
                                successfullyMoved++;
                                changed = true;
                                console.log(`Moved transaction ${tx.id} to account ${account.name}`);
                            } else {
                                console.log(`Transaction ${tx.id} already exists in account ${account.name}`);
                                successfullyMoved++; // Count as successful since it's already there
                            }
                        } else {
                            console.warn(`Account with id ${tx.accountId} not found for transaction ${tx.id}`);
                            failedToMove++;
                        }
                    }

                    //  Only remove top-level transactions if ALL were successfully handled
                    if (failedToMove === 0 && successfullyMoved === topLevelTransactions.length) {
                        (doc as any).transactions = undefined;
                        changed = true;
                        console.log(`Safely removed top-level transactions array (handled ${successfullyMoved} transactions)`);
                    } else {
                        console.warn(`Cannot remove top-level transactions: ${failedToMove} failed, ${successfullyMoved} succeeded`);
                    }
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

                //  Validate data integrity after migration
                if (changed) {
                    for (const account of doc.accounts) {
                        if (account.transactions) {
                            for (const tx of account.transactions) {
                                if (!tx.id || !(tx as any).accountId) {
                                    throw new Error(`Data integrity check failed: Invalid transaction in account ${account.name}`);
                                }
                            }
                        }
                    }
                }

                if (changed) {
                    if (!DRY_RUN) {
                        await doc.save();
                        updateCount++;
                        console.log(` Successfully migrated document ${doc._id}`);
                    } else {
                        console.log(`Would update document ${doc._id} (DRY RUN)`);
                        updateCount++;
                    }
                }
            } catch (error) {
                console.error(`Failed to migrate document ${doc._id}:`, error);
                errorCount++;
                
                // Stop if too many errors
                if (errorCount >= MAX_ERRORS) {
                    throw new Error(`Too many errors (${errorCount}), stopping migration for safety`);
                }
            }
        }
        
        processed += docs.length;
        console.log(`Progress: ${processed}/${totalDocs} (${Math.round(processed/totalDocs*100)}%) - Updated: ${updateCount}, Errors: ${errorCount}`);
    }

    console.log(`Migration complete. Updated: ${updateCount}, Errors: ${errorCount}`);
    
    if (errorCount > 0) {
        console.warn(`Migration completed with ${errorCount} errors. Please review the logs.`);
    }
    
    mongoose.disconnect();
}

migrate().catch(err => {
    console.error("Migration error:", err);
    mongoose.disconnect();
    process.exit(1);
});