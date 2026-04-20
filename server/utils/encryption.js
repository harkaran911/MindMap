import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const algorithm = "aes-256-ctr";
const secretKey = process.env.ENCRYPTION_KEY;

export const encrypt = (text) => {
  if (!text) return text;
  // If it's already encrypted (starts with standard hex iv pattern), return it
  if (text.includes(":")) {
    const parts = text.split(":");
    if (parts[0].length === 32) return text;
  }
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, "hex"), iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decrypt = (hash) => {
  if (!hash || !hash.includes(":")) return hash;

  const [ivHex, contentHex] = hash.split(":");
  if (ivHex.length !== 32) return hash; // Validation to ensure it's a valid IV

  try {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, "hex"), Buffer.from(ivHex, "hex"));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(contentHex, "hex")), decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.error("Decryption failed:", err.message);
    return hash; // If decryption fails, return the original corrupted hash rather than crashing DB loads
  }
};
