import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const PASSWORD_KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;

  return `scrypt:${salt}:${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const [algorithm, salt, keyHex] = passwordHash.split(":");

  if (algorithm !== "scrypt" || !salt || !keyHex) {
    return false;
  }

  const expectedKey = Buffer.from(keyHex, "hex");
  const candidateKey = (await scrypt(password, salt, expectedKey.length)) as Buffer;

  return timingSafeEqual(candidateKey, expectedKey);
}
