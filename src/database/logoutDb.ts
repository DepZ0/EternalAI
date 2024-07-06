import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { refreshTokens } from "../schema";
import { eq } from "drizzle-orm";
import { Pool } from "pg";

export class LogoutDb {
  constructor(private db: NodePgDatabase, private pool: Pool) {}

  public logout = async (refreshToken: string) => {
    await this.db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken)).execute();
  };
}
