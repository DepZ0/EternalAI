import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { refreshTokens, users } from "../schema";
import { Pool } from "pg";
import { and, eq, sql } from "drizzle-orm";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class LoginDb {
  constructor(private db: NodePgDatabase, private pool: Pool) {}

  public login = async (userAgent: string, email: string, password: string) => {
    const user = await this.db.select().from(users).where(eq(users.email, email)).execute();
    if (user.length === 0) {
      return { error: `User with email'${email}' not found` };
    }

    const passwordIsValid = bcrypt.compareSync(password, user[0].passwordHash);
    if (!passwordIsValid) {
      return { error: "Incorrect password" };
    }

    const accessToken = jwt.sign({ id: user[0].id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    });
    const refreshToken = jwt.sign({ id: user[0].id }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
    });

    const sessionsIdGeneration = (await this.db.select().from(refreshTokens)).length + 1;
    const existingToken = await this.db
      .select()
      .from(refreshTokens)
      .where(and(eq(refreshTokens.userId, Number(user[0].id)), eq(refreshTokens.device, userAgent)))
      .execute();

    let refreshTokenExpiresIn;
    if (existingToken.length === 0) {
      refreshTokenExpiresIn = new Date();
      refreshTokenExpiresIn.setDate(refreshTokenExpiresIn.getDate() + 7); // 7 days later

      await this.db
        .insert(refreshTokens)
        .values({
          id: sessionsIdGeneration,
          userId: user[0].id,
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
  };
}
