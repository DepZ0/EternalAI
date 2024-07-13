import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { refreshTokens, users } from "../schema";
import { and, eq, sql } from "drizzle-orm";
import jwt from "jsonwebtoken";

export class GoogleAuthDb {
  constructor(private db: NodePgDatabase, private pool: Pool) {}

  private async emailExists(email: string, googleId: string): Promise<boolean> {
    const existingUsers = await this.db.select().from(users).where(eq(users.email, email)).execute();
    return existingUsers.length > 0 && existingUsers[0].googleId !== googleId;
  }

  private async getUserByGoogleId(googleId: string) {
    const existingUsers = await this.db.select().from(users).where(eq(users.googleId, googleId)).execute();
    return existingUsers.length > 0 ? existingUsers[0] : null;
  }

  public googleAuth = async (googleId: string, email: string, userAgent: string) => {
    // Check if user exists by Google ID first
    const existingUser = await this.getUserByGoogleId(googleId);
    if (existingUser) {
      const tokens = await this.generateTokens(existingUser.id, userAgent);
      return { user: existingUser, ...tokens };
    }

    // Check if email already exists
    if (await this.emailExists(email, googleId)) {
      return { error: "User with this email already exists" };
    }

    // Create new user
    const accountsCount = await this.db.select().from(users).execute();
    const accountsIdGeneration = accountsCount.length + 1;

    const newUser: NewUser = {
      id: accountsIdGeneration,
      googleId: googleId,
      email: email,
      passwordHash: "",
    };

    await this.db.insert(users).values(newUser).execute();

    const tokens = await this.generateTokens(newUser.id, userAgent);
    return { success: true, user: newUser, ...tokens };
  };

  private async generateTokens(userId: number, userAgent: string) {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    });
    const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    });

    const sessionsIdGeneration = (await this.db.select().from(refreshTokens)).length + 1;
    const existingToken = await this.db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.device, userAgent)))
      .execute();

    let refreshTokenExpiresIn;
    if (existingToken.length === 0) {
      refreshTokenExpiresIn = new Date();
      refreshTokenExpiresIn.setDate(refreshTokenExpiresIn.getDate() + 7); // 7 days later

      await this.db
        .insert(refreshTokens)
        .values({
          id: sessionsIdGeneration,
          userId: userId,
          token: refreshToken,
          createdAt: sql`CURRENT_TIMESTAMP`,
          expiresIn: sql`NOW() + INTERVAL '7 days'`,
          device: userAgent,
        })
        .execute();
    } else {
      refreshTokenExpiresIn = existingToken[0].expiresIn;

      await this.db
        .update(refreshTokens)
        .set({
          token: refreshToken,
          createdAt: sql`CURRENT_TIMESTAMP`,
          expiresIn: sql`NOW() + INTERVAL '7 days'`,
        })
        .where(eq(refreshTokens.device, userAgent))
        .execute();
    }

    return { accessToken, refreshToken, refreshTokenExpiresIn };
  }
}

type NewUser = {
  id: number;
  googleId: string;
  email: string;
  passwordHash: string;
};
