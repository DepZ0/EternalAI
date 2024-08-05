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
}
