import { UserService } from "express/services/userService";
import { Controller } from "./Controller";
import { authenticateToken, RequestWithUser } from "util/authenticateToken";
import { RequestHandler } from "express";
import { extractAccessToken } from "util/extractTokens";

export class UserController extends Controller {
  constructor(private userService: UserService) {
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
}
