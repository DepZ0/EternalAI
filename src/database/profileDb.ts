import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { users } from "../schema";
import { eq } from "drizzle-orm";
import { Pool } from "pg";

export class ProfileDb {
  constructor(private db: NodePgDatabase, private pool: Pool) {}

  public findPofile = async (userId: number) => {
    const profile = await this.db.select().from(users).where(eq(users.id, userId));

    return {
      email: profile[0].email,
      phone: profile[0].phone,
      createdAt: profile[0].createdAt,
      updatedAt: profile[0].updatedAt,
    };
  };
}
