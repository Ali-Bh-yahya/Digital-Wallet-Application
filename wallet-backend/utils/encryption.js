// src/utils/encryption.js
import crypto from "crypto";
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.SECRET_KEY) {
  console.warn("WARNING: SECRET_KEY is not set in your .env");
}

const algorithm = "aes-256-cbc";
const key = crypto.createHash("sha256").update(String(process.env.SECRET_KEY || "")).digest();

export function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encryptedBuffer = Buffer.concat([cipher.update(String(text), "utf8"), cipher.final()]);
  return {
    iv: iv.toString("hex"),
    data: encryptedBuffer.toString("hex")
  };
}

export function decrypt(encrypted) {
  const iv = Buffer.from(encrypted.iv, "hex");
  const encryptedData = Buffer.from(encrypted.data, "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decryptedBuffer = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decryptedBuffer.toString("utf8");
}