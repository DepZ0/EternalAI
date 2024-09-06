import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { users } from "../schema";
import { NewUser } from "express/services/authSystemService";

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
    name,
    email,
    password,
    stripeCustomerId,
  }: {
    name: string;
    email: string;
    password: string;
    stripeCustomerId: string;
  }) {
    const user = await this.db
      .insert(users)
      .values({
        name: name, // ------------------------------ FIX
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
    name,
    email,
    stripeCustomerId,
  }: {
    googleId: string;
    name: string;
    email: string;
    stripeCustomerId: string;
  }) => {
    // Create new user

    const newUser: NewUser = {
      googleId: googleId,
      name: name,
      email: email,
      passwordHash: "",
      stripeCustomerId: stripeCustomerId,
    };

    const user = await this.db.insert(users).values(newUser).returning();

    return user[0];
  };

  public async updateGoogleId(userId: number, googleId: string) {
    const user = await this.db.update(users).set({ googleId }).where(eq(users.id, userId)).returning();

    return user[0];
  }

  public login = async (email: string, password: string) => {
    const user = await this.db.select().from(users).where(eq(users.email, email));

    return user[0];
  };
}
