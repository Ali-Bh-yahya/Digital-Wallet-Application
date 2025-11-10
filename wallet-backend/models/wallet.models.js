// src/models/wallet.models.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { encrypt, decrypt } from "../utils/encryption.js"; // AES-256-GCM helpers

const { Schema, model } = mongoose;

// ---- Virtual Card Schema ----
const VirtualCardSchema = new mongoose.Schema({
  cardNumber: { type: String, required: true },
  cardHolderName: { type: String, required: true },
  expirationDate: { type: String, required: true },
  cvv: {
    iv: { type: String, required: true },
    data: { type: String, required: true }
  }
});
  
// Pre-save hook to encrypt CVV if plain string is assigned
VirtualCardSchema.pre("save", function (next) {
  if (!this.isModified("cvv")) return next();

  // If cvv is already encrypted object, skip
  if (this.cvv && this.cvv.iv && this.cvv.data && this.cvv.tag) {
    return next();
  }

  // Encrypt plain CVV string
  if (typeof this.cvv === "string") {
    this.cvv = encrypt(this.cvv);
  }

  next();
});

// Method to decrypt CVV safely
VirtualCardSchema.methods.getCVV = function () {
  if (this.cvv && this.cvv.iv && this.cvv.data && this.cvv.tag) {
    return decrypt(this.cvv);
  }
  return null;
};

// ---- User Schema ----
const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    status: { type: String, enum: ["pending", "active", "rejected", "suspended"], default: "pending" },
    phone: { type: String, required: true },
    idNumber: { type: String, required: true },
    idCardImage: { type: String }, // Add this field to store the image path
    walletBalance: { type: Number, default: 0 },
    virtualCard: { type: VirtualCardSchema },
  },
  { timestamps: true }
);
// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = model("User", UserSchema);
export default User;