import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { refreshTokens, users } from "../schema";
import { eq } from "drizzle-orm";
import { Pool } from "pg";

export class DeleteAccountDb {
  constructor(private db: NodePgDatabase, private pool: Pool) {}

  public deleteAccount = async (userId: number) => {
    await this.db.delete(users).where(eq(users.userId, userId)).execute();
    await this.db.delete(refreshTokens).where(eq(refreshTokens.userId, userId)).execute();
  };
}
