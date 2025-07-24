import mongoose from "mongoose";
import User from "./models/User";
require("dotenv").config();

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  throw new Error("MONGO_URI is not defined in the environment variables.");
}

mongoose.connect(mongoUri).then(async () => {
  const email = "rudreshnaidu.66@email.com";
  await User.findOneAndUpdate({ email }, { isAdmin: true });
  console.log("Admin access granted!");
  process.exit(0);
});