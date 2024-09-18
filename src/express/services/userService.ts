import { UserDataBase } from "database/userDb";
import { StripeService } from "./stripeService";
import bcrypt from "bcryptjs";
import { emailRegex, validateEmail, validateName, validatePassword } from "util/validation";
import { ulid } from "ulid";
import { is } from "drizzle-orm";

export class UserService {
  constructor(private userDb: UserDataBase, private stripeService: StripeService) {}

  public async getProfile(userId: number) {
    try {
      return await this.userDb.getProfileByEmail(userId);
    } catch (error) {
      return error;
    }
  }

  public changeProfileDetails = async (body: {
    id: number;
    email: string;
    name?: string;
    password?: string;
    phone?: string;
  }) => {
    const updateData: Partial<NewUser> = {};

    const { id, email, name, password, phone } = body;

    if (email) {
      const user = await this.userDb.getUserById(id);
      if (user.googleId) {
        if (user.passwordHash === "") {
          return { error: "Set PASSWORD before changing Email" };
        }
      }

      const emailError = validateEmail(email);
      if (emailError) {
        return { error: emailError };
      }
      if (await this.userDb.getUserByEmail(email)) {
        return { error: `User with email '${email}' already exists` };
      }

      updateData.email = email;
    }

    if (name) {
      const nameError = validateName(name);
      if (nameError) {
        return { error: nameError };
      }

      updateData.name = name;
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

    updateData.updatedAt = new Date();

    await this.userDb.changeProfileDetails(updateData, id);

    const result = await this.getProfile(body.id);
    return result;
  };

  public getPaymentLink = async (userId: number) => {
    const customer = await this.userDb.getUserById(userId);
    const result = await this.stripeService.getStripePaymentLink(customer.stripeCustomerId);

    return result;
  };

  public async updatePaymentMethod(userId: number, paymentMethodId: string) {
    const user = await this.userDb.getUserById(userId);

    if (!user.stripeCustomerId) {
      throw new Error("Customer not found.");
    }

    await this.stripeService.updatePaymentMethod(user.stripeCustomerId, paymentMethodId);

    return { message: "Payment method updated successfully." };
  }

  public cancelSubscriptionRenewal = async (userId: number) => {
    try {
      const user = await this.userDb.getUserById(userId);
      const userSubscription = await this.userDb.getSubscriptionByUserId(userId);

      if (!userSubscription) {
        return { error: "No subscription found for this user." };
      }

      const result = await this.stripeService.cancelSubscriptionAtPeriodEnd(userSubscription.subId);

      return { message: "Subscription renewal canceled successfully", result };
    } catch (error) {
      console.error("Error canceling subscription renewal:", error);
      return { error: "Failed to cancel subscription renewal." };
    }
  };

  public getSharedBonusMessages = async (userId: number) => {
    const result = await this.userDb.getSharedBonusMessages(userId);
    return { message: "Successful" };
  };

  public getUserByEmail = async (email: string) => {
    const user = await this.userDb.getUserByEmail(email);
    return user;
  };

  public genarationResetPasswordLink = async (userId: number) => {
    let code = ulid();
    let isExistCode = await this.userDb.getUserByResetCode(code);

    while (isExistCode) {
      code = ulid();
      isExistCode = await this.userDb.getUserByResetCode(code);
    }

    const setCodeToDb = await this.userDb.getSetPasswordResetCode(userId, code);

    return code;
  };

  public checkResetPasswordCode = async (userId: number, code: string) => {
    const existCode = await this.userDb.getUserByResetCode(code);

    if (userId === existCode.userId) {
      return true;
    }
    return false;
  };

  // Сгенерили код и проверили есть ли еще такой код, теперь нужно проверить дату експайра и подключить в контроллер
  // Создать эндпоинт для получения кода, создать эндпоинт для проверки кода (в проверке нужно проверить есть ли такой код у этого юзера и его время экспаера)
  // Еще 1 ендпоинт в который примит в себя код и новый пароль
}

export type NewUser = {
  email: string;
  name: string;
  passwordHash: string;
  phone: string;
  updatedAt: Date;
};
