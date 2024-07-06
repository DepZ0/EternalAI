import { RequestHandler } from "express";
import { Controller } from "./Controller";
import { LogoutService } from "../services/logoutService";

export class LogoutController extends Controller {
  constructor(private logoutService: LogoutService) {
    super("/logout");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.delete("/", this.logout);
  };

  private logout: RequestHandler = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(403).json({ error: "Refresh token is required" });
    }

    await this.logoutService.logout(refreshToken);

    return res.status(200).json({ message: "Logged out successfully" });
  };
}
