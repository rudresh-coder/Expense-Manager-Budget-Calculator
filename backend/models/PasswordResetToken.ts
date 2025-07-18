import mongoose, { Schema, Document } from "mongoose";

interface IPasswordResetToken extends Document {
  email: string;
  token: string;
  expires: Date;
}

const PasswordResetTokenSchema: Schema = new Schema({
  email: { type: String, required: true },
  token: { type: String, required: true },
  expires: { type: Date, required: true, index: { expires: 0 } }, 
});

export default mongoose.model<IPasswordResetToken>("PasswordResetToken", PasswordResetTokenSchema);