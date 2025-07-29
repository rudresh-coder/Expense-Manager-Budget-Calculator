import mongoose from "mongoose";
import fs from "fs";
import dotenv from "dotenv";
import ExpenseManagerData from "./models/ExpenseManagerData";

dotenv.config();

async function backup() {
  await mongoose.connect(process.env.MONGO_URI!);
  const backupDir = './backups';
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `${backupDir}/backup-${timestamp}.json`;

  const writeStream = fs.createWriteStream(backupFile, { encoding: "utf8" });
  writeStream.on("error", (err) => {
    console.error("File write error:", err);
    process.exit(1);
  });
  writeStream.write("[\n");

  const cursor = ExpenseManagerData.find({}).lean().cursor();
  let first = true;
  for await (const doc of cursor) {
    if (!first) writeStream.write(",\n");
    writeStream.write(JSON.stringify(doc, null, 2));
    first = false;
  }
  writeStream.write("\n]\n");

  await new Promise((resolve, reject) => {
    writeStream.end(() => resolve(undefined));
    writeStream.on("error", reject);
  });

  console.log(`Backup created: ${backupFile}`);
  await mongoose.disconnect();
}

backup().catch(err => {
  console.error("Backup error:", err);
  process.exit(1);
});