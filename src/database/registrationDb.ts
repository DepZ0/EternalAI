import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { users } from "../schema";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export class RegistrationDb {
  constructor(private db: NodePgDatabase, private pool: Pool) {}
  public registration = async (email: string, password: string) => {
    if (!password || !email) {
      return { error: "Requires a password and either email or nickname" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: "Invalid email format" };
    }

    const existingUsers = await this.db.select().from(users).where(eq(users.email, email)).execute();
    if (existingUsers.length > 0) {
      return { error: `User with email ${email} already exists` };
    }

    if (password.length < 6) {
      return { error: "Invalid password. Minimum length 6 characters" };
    }

    const accountsIdGeneration = (await this.db.select().from(users)).length + 1;

    const hashedPassword = bcrypt.hashSync(password, 5);
    const newUser: NewUser = {
      id: accountsIdGeneration,
      email: email,
      passwordHash: hashedPassword,
    };

    await this.db.insert(users).values(newUser);
  };
}

type NewUser = typeof users.$inferInsert;
