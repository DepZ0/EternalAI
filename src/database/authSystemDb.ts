import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { users } from "../schema";
import { NewUser } from "express/services/authSystemService";
import bcrypt from "bcryptjs";

export class AuthDataBase {
  constructor(private db: NodePgDatabase) {}

  public async getUserByEmail(email: string) {
    const existingUsers = await this.db.select().from(users).where(eq(users.email, email));
    return existingUsers[0];
  }

  public async getUserByGoogleId(googleId: string) {
    const existingUsers = await this.db.select().from(users).where(eq(users.googleId, googleId));
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

  // Google AUTH

  public googleAuth = async ({
    googleId,
    email,
    stripeCustomerId,
  }: {
    googleId: string;
    email: string;
    stripeCustomerId: string;
  }) => {
    // Create new user

    const newUser: NewUser = {
      googleId: googleId,
      email: email,
      passwordHash: "",
      stripeCustomerId: stripeCustomerId,
    };

    const user = await this.db.insert(users).values(newUser).returning();

    return user[0];
  };

  public login = async (email: string, password: string) => {
    const user = await this.db.select().from(users).where(eq(users.email, email));

    return user[0];
  };
}
