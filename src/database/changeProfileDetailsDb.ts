import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { users } from "../schema";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { validateEmail, validatePassword } from "../util/validation";

type NewUser = typeof users.$inferInsert;

export class ChangeProfileDetailsDb {
  constructor(private db: NodePgDatabase, private pool: Pool) {}

  private async emailExists(email: string, userId: number): Promise<boolean> {
    const existingUsers = await this.db.select().from(users).where(eq(users.email, email)).execute();
    return existingUsers.length > 0 && existingUsers[0].id !== userId;
  }

  public changeProfileDetails = async (
    id: number,
    email?: string,
    password?: string,
    phone?: string
  ): Promise<{ error?; message?: string }> => {
    const updateData: Partial<NewUser> = {};

    if (email) {
      const emailError = validateEmail(email);
      if (emailError) {
        return { error: emailError };
      }

      if (await this.emailExists(email, id)) {
        return { error: "User with this email already exists" };
      }

      updateData.email = email;
    }

    if (password) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        return { error: passwordError };
      }

      updateData.passwordHash = bcrypt.hashSync(password, 8);
    }

    if (phone) {
      updateData.phone = phone;
    }

    if (Object.keys(updateData).length === 0) {
      return { message: "No values to set" };
    }

    updateData.updatedAt = new Date(); // Добавление времени обновления

    await this.db.update(users).set(updateData).where(eq(users.id, id)).execute();

    return { message: "Profile details updated successfully" };
  };
}
