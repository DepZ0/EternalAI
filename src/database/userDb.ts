import { and, eq, gt } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { messages, passwordReset, subscriptions, users, UsersSelect } from "schema";

export class UserDataBase {
  constructor(private db: NodePgDatabase) {}

  public async getUserByEmail(email: string) {
    const [existingUsers] = await this.db.select().from(users).where(eq(users.email, email));
    const user = {
      id: existingUsers.id,
      name: existingUsers.name,
      email: existingUsers.email,
      phone: existingUsers.phone,
      createdAt: existingUsers.createdAt,
      updatedAt: existingUsers.updatedAt,
    };
    return user;
  }

  public async getUserById(userId: number): Promise<UsersSelect> {
    const existingUsers = await this.db.select().from(users).where(eq(users.id, userId));
    return existingUsers[0];
  }

  public async getSubscriptionByUserId(userId: number) {
    const subscription = await this.db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
    return subscription[0];
  }

  public async getProfileByEmail(userId: number) {
    const findProfile = await this.db.select().from(users).where(eq(users.id, userId));

    const profile = {
      name: findProfile[0].name,
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

  public async getSharedBonusMessages(userId: number) {
    const user = await this.db.update(users).set({ sharedBonusMessages: true }).where(eq(users.id, userId));
    return;
  }

  public async getUserByResetCode(code: string) {
    const [user] = await this.db
      .select()
      .from(passwordReset)
      .where(
        and(
          eq(passwordReset.code, code),
          gt(passwordReset.endDate, Math.floor(new Date().getTime() / 1000)) // Проверка на время жизни кода
        )
      );

    return user; // Если результат — это массив, возвращаем первый элемент
  }

  public async getSetPasswordResetCode(userId: number, code: string) {
    const expirationDate = Math.floor(new Date().getTime() / 1000) + 600; // 10 minutes

    const setCode = await this.db
      .insert(passwordReset)
      .values({
        userId: userId,
        code: code,
        endDate: expirationDate,
      })
      .returning();

    return;
  }

  public async updateUserPassword(userId: number, hashedPassword: string, code: string) {
    const result = await this.db
      .update(users)
      .set({
        passwordHash: hashedPassword,
      })
      .where(eq(users.id, userId));

    const delResetCode = await this.db.delete(passwordReset).where(eq(passwordReset.code, code));

    return { message: true };
  }
}
