import { RequestHandler } from "express";
import { Controller } from "./Controller";
import { RefreshTokenService } from "../services/refreshTokenService";
import { extractAccessToken, extractRefreshToken } from "../../util/extractTokens";
import { authenticateToken, RequestWithUser } from "util/authenticateToken";

export class RefreshTokenController extends Controller {
  constructor(private refreshTokenService: RefreshTokenService) {
    super("/refresh-token");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post("/", extractRefreshToken, extractAccessToken, authenticateToken, this.refreshToken);
  };

  private refreshToken: RequestHandler = async (req: RequestWithUser, res) => {
    const { refreshToken } = req.body;
    const userId = Number(req.user?.id);

    if (!refreshToken) {
      return res.status(403).json({ error: "Access is forbidden" });
    }

    const result = await this.refreshTokenService.refreshToken(userId, refreshToken);

    if (result.error) {
      return res.status(403).json({ error: result.error });
    }

    res.cookie("accessToken", result.accessToken, { maxAge: 1000 * 60 * 120, httpOnly: true });

    return res.status(200).json("OK");
  };
}
