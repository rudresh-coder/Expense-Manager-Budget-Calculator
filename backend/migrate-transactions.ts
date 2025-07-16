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
        for (const tx of doc.transactions) {
            if (!tx.id && tx._id) {
                tx.id = tx._id.toString();
                changed = true;
            }
        }
        if (changed) {
            await doc.save();
            updateCount++;
            console.log(`Update document ${doc._id}`);
        }
    }

    console.log(`Migration complete. Update ${updateCount} documents.`);
    mongoose.disconnect();
}

migrate().catch(err => {
    console.log("Migration error:", err);
    mongoose.disconnect();
});