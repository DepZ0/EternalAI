import { RequestHandler } from "express";
import { Controller } from "./Controller";
import { RefreshTokenService } from "../services/refreshTokenService";
import { extractRefreshToken } from "../../util/extractTokens";

export class RefreshTokenController extends Controller {
  constructor(private refreshTokenService: RefreshTokenService) {
    super("/refresh-token");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post("/", extractRefreshToken, this.refreshToken);
  };

  private refreshToken: RequestHandler = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(403).json({ error: "Access is forbidden" });
    }

    const result = await this.refreshTokenService.refreshToken(req.headers["user-agent"] || "unknown", refreshToken);

    if (result?.error) {
      return res.status(403).json({ error: result.error });
    }

    res.cookie("accessToken", result.accessToken, { maxAge: 1000 * 60 * 120, httpOnly: true });

    return res.status(200).json("OK");
  };
}
