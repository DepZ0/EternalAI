import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { users } from "../schema";

export class AuthDataBase {
  constructor(private db: NodePgDatabase) {}

  public async getUserByEmail(email: string) {
    const existingUsers = await this.db.select().from(users).where(eq(users.email, email));
    return existingUsers[0];
  }

  public async createAndGetUser({
    email,
    password,
    stripeCustomerId,
  }: {
    email: string;
    password: string;
    stripeCustomerId: string;
  }) {
    const user = await this.db
      .insert(users)
      .values({
        email: email,
        passwordHash: password,
        stripeCustomerId: stripeCustomerId,
      })
      .returning();

    return user[0];
  }
}
