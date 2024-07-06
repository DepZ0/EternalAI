import { Controller } from "./Controller";
import { ChangeProfileDetailsService } from "../services/changeProfileDetailsService";
import { Response, RequestHandler } from "express";
import { authenticateToken, RequestWithUser } from "../../util/authenticateToken";
import { extractAccessToken } from "../../util/extractTokens";

export class ChangeProfileDetailsController extends Controller {
  constructor(private changeProfileDetailsService: ChangeProfileDetailsService) {
    super("/details");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post("/", extractAccessToken, authenticateToken, this.changeDetails);
  };

  private changeDetails: RequestHandler = async (req: RequestWithUser, res: Response) => {
    const { email, password, phone } = req.body;
    const id = Number(req.user?.id);
    const result = await this.changeProfileDetailsService.changeDetails(id, email, password, phone);

    if (req.body.password) {
      res.cookie("refreshToken", { maxAge: -1, httpOnly: true });
      res.cookie("accessToken", { maxAge: -1, httpOnly: true });
    }

    if (result?.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json(result);
  };
}
