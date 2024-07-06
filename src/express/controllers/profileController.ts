import { RequestHandler, Response } from "express";
import { Controller } from "./Controller";
import { ProfileService } from "../services/profileService";
import { RequestWithUser, authenticateToken } from "../../util/authenticateToken";
import { extractAccessToken } from "../../util/extractTokens";

export class ProfileController extends Controller {
  constructor(private profileService: ProfileService) {
    super("/profile");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get("/", extractAccessToken, authenticateToken, this.findProfile);
  };

  private findProfile: RequestHandler = async (req: RequestWithUser, res: Response) => {
    const userId = Number(req.user?.id);
    const result = await this.profileService.findProfile(userId);

    if (result?.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json(result);
  };
}
