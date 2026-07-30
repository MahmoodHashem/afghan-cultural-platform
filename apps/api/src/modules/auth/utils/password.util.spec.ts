import { hashPassword, hashRefreshToken, verifyPassword } from "@/modules/auth/utils/password.util";

describe("password utilities", () => {
  it("hashes and verifies a valid password", async () => {
    const password = "correct horse battery staple";
    const passwordHash = await hashPassword(password);

    expect(passwordHash).not.toBe(password);
    expect(await verifyPassword(passwordHash, password)).toBe(true);
  });

  it("rejects an invalid password", async () => {
    const passwordHash = await hashPassword("correct password");

    expect(await verifyPassword(passwordHash, "wrong password")).toBe(false);
  });

  it("hashes refresh tokens with the same verification primitive", async () => {
    const refreshToken = "refresh-token-value";
    const tokenHash = await hashRefreshToken(refreshToken);

    expect(tokenHash).not.toBe(refreshToken);
    expect(await verifyPassword(tokenHash, refreshToken)).toBe(true);
  });
});
