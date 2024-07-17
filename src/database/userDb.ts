import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { users, UsersSelect } from "schema";

export class UserDataBase {
  constructor(private db: NodePgDatabase) {}

  public async getUserByEmail(email: string) {
    const existingUsers = await this.db.select().from(users).where(eq(users.email, email));
    return existingUsers[0];
  }

  public async getUserById(userId: number): Promise<UsersSelect> {
    const existingUsers = await this.db.select().from(users).where(eq(users.id, userId));
    return existingUsers[0];
  }

  public async getProfileByEmail(userId: number) {
    const findProfile = await this.db.select().from(users).where(eq(users.id, userId));

    const profile = {
      email: findProfile[0].email,
      phone: findProfile[0].phone,
      createdAt: findProfile[0].createdAt,
      updatedAt: findProfile[0].updatedAt,
    };

    return profile;
  }

  public async changeProfileDetails(updateData: Object, userId: number) {
    const user = await this.db.update(users).set(updateData).where(eq(users.id, userId)).returning();
    return user[0];
  }
}
