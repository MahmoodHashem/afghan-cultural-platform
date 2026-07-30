import { argon2id, type HashOptions, hash, verify } from "argon2";

const ARGON2_OPTIONS: HashOptions = {
  type: argon2id as HashOptions["type"],
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

async function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

async function verifyPassword(passwordHash: string, password: string): Promise<boolean> {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

async function hashRefreshToken(refreshToken: string): Promise<string> {
  return hash(refreshToken, ARGON2_OPTIONS);
}

export { hashPassword, hashRefreshToken, verifyPassword };
