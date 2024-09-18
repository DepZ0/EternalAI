import { UserService } from "express/services/userService";
import { Controller } from "./Controller";
import { authenticateToken, RequestWithUser } from "util/authenticateToken";
import { RequestHandler } from "express";
import { extractAccessToken } from "util/extractTokens";
import { UserDataBase } from "database/userDb";
import bcrypt from "bcryptjs";
import { userPasswordForReesetSchema } from "util/zodSchemas";
import sendEmail from "util/sendResetCodeToEmail";

export class UserController extends Controller {
  constructor(private userService: UserService, private userDb: UserDataBase) {
    super("/");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get("/profile", extractAccessToken, authenticateToken, this.getProfile);
    this.router.post("/change-details", extractAccessToken, authenticateToken, this.changeProfileDetails);
    this.router.post("/buy-sub", extractAccessToken, authenticateToken, this.createPaymentLink);
    this.router.post("/update-payment-method", extractAccessToken, authenticateToken, this.updatePaymentMethod);
    this.router.post("/cancel-subscription", extractAccessToken, authenticateToken, this.cancelSubscription);
    this.router.post("/get-bonus-messages", extractAccessToken, authenticateToken, this.getSharedBonusMessages);
    this.router.post("/get-reset-pass-code", this.getResetPasswordCode);
    this.router.post("/check-reset-pass-code", this.checkResetPasswordCode);
    this.router.post("/reset-password", this.resetPassword);
  };

  private getProfile: RequestHandler = async (req: RequestWithUser, res) => {
    const userId = Number(req.user?.id);
    const result = await this.userService.getProfile(userId);

    return res.status(200).json(result);
  };

  private changeProfileDetails: RequestHandler = async (req: RequestWithUser, res) => {
    const { email, name, password, phone } = req.body;
    const id = Number(req.user?.id);
    const result = await this.userService.changeProfileDetails({ id, email, name, password, phone });

    if (req.body.password) {
      res.cookie("refreshToken", { maxAge: -1, httpOnly: true });
      res.cookie("accessToken", { maxAge: -1, httpOnly: true });
    }

    return res.status(200).json(result);
  };

  private createPaymentLink: RequestHandler = async (req: RequestWithUser, res) => {
    const id = Number(req.user?.id);

    const paymentUrl = String((await this.userService.getPaymentLink(id)).url);

    res.redirect(paymentUrl);
  };

  private updatePaymentMethod: RequestHandler = async (req: RequestWithUser, res) => {
    const userId = Number(req.user?.id);
    const { paymentMethodId } = req.body;

    try {
      const result = await this.userService.updatePaymentMethod(userId, paymentMethodId);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.raw.message });
    }
  };

  private cancelSubscription: RequestHandler = async (req: RequestWithUser, res) => {
    const userId = Number(req.user?.id);

    const result = await this.userService.cancelSubscriptionRenewal(userId);

    if (result.error) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  };

  private getSharedBonusMessages: RequestHandler = async (req: RequestWithUser, res) => {
    const userId = Number(req.user?.id);

    try {
      const result = await this.userService.getSharedBonusMessages(userId);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  };

  private getResetPasswordCode: RequestHandler = async (req, res) => {
    try {
      const { email } = req.body;

      // Предполагаем, что у вас есть метод для получения пользователя по email
      const user = await this.userService.getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const code = await this.userService.genarationResetPasswordLink(user.id);

      // Тут отправьте код на email пользователя или верните его для тестов
      const sendCodeToEmail = await sendEmail(email, user.name, code);
      return res.status(200).json({ message: "Reset password code generated, check your email" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to generate reset password link" });
    }
  };

  private checkResetPasswordCode: RequestHandler = async (req, res) => {
    try {
      const { code } = req.body;
      const { email } = req.body;

      const user = await this.userService.getUserByEmail(email);

      const isValid = await this.userService.checkResetPasswordCode(user.id, code); // Передаем только код

      if (isValid) {
        return res.status(200).json({ message: "Code is valid" });
      } else {
        return res.status(400).json({ error: "Invalid or expired code" });
      }
    } catch (error) {
      return res.status(500).json({ error: "Failed to check reset password code" });
    }
  };

  private resetPassword: RequestHandler = async (req, res) => {
    try {
      const { code } = req.body;
      const { newPassword } = userPasswordForReesetSchema.parse(req.body);
      const user = await this.userDb.getUserByResetCode(code); // Получаем пользователя по коду

      if (!user) {
        return res.status(400).json({ error: "Invalid or expired code" });
      }

      const hashedPassword = await bcrypt.hashSync(newPassword, 5);
      await this.userDb.updateUserPassword(user.userId, hashedPassword, code); // Обновляем пароль пользователя

      return res.status(200).json({ message: "Password has been reset" });
    } catch (error) {
      return res.status(500).json({ error: "Failed to reset password" });
    }
  };
}
