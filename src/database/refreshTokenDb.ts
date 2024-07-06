import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { refreshTokens, users } from "../schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

export class RefreshTokenDb {
  constructor(private db: NodePgDatabase, pool: Pool) {}

  public refreshToken = async (userAgent: string, refreshToken: string) => {
    // Проверка существования токена
    const tokenResult = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, refreshToken))
      .execute();
    if (tokenResult.length === 0) {
      return { error: "Invalid refresh token" };
    }

    const token = tokenResult[0];

    // Проверка валидности токена
    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return { error: "Invalid refresh token" };
    }

    // Получение информации о пользователе
    const userResult = await this.db
      .select()
      .from(users)
      .where(eq(users.id, Number(token.userId)))
      .execute();

    if (userResult.length === 0) {
      return { error: "User not found" };
    }

    const user = userResult[0];

    // Генерация нового access токена
    const accessToken = jwt.sign({ id: token.userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
    });

    return { accessToken };
  };
}
