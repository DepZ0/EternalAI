import { RequestHandler } from "express";
import { Controller } from "./Controller";
import { GoogleAuthService } from "../services/googleAuthService";
import {
  GOOGLE_AUTH_URI,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  GOOGLE_SCOPES,
  GOOGLE_TOKEN_URI,
  GOOGLE_USER_INFO_URI,
} from "../../googleAuth/googleSettings";
import axios from "axios";

export class GoogleAuthController extends Controller {
  constructor(private googleAuthService: GoogleAuthService) {
    super("/google-auth");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.get("/", this.googleLink);
    this.router.get("/google-callback", this.googleCallback);
    this.router.get("/google-result", this.googleResult);
  };

  private googleLink: RequestHandler = async (req, res) => {
    const parameters = {
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      client_id: GOOGLE_CLIENT_ID,
      scope: GOOGLE_SCOPES.join(" "),
    };

    const authUri = `${GOOGLE_AUTH_URI}?${new URLSearchParams(parameters).toString()}`;

    res.redirect(authUri);
  };

  private googleCallback: RequestHandler = async (req, res) => {
    const code = req.query.code as string;

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
      code: code,
    });

    try {
      const response = await axios.post(GOOGLE_TOKEN_URI, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const data = response.data;
      const accessToken = data.access_token;

      res.redirect(`/google-auth/google-result?token=${accessToken}`);
    } catch (error) {
      res.status(500).json({ error: "Failed to get access token" });
    }
  };

  private googleResult: RequestHandler = async (req, res) => {
    const token = req.query.token as string;
    try {
      const response = await axios.get(GOOGLE_USER_INFO_URI, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userInfo = response.data;

      const { id: googleId, email } = userInfo;
      const userAgent = req.headers["user-agent"] || "unknown";

      const result = await this.googleAuthService.googleAuth(googleId, email, userAgent);
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.cookie("refreshToken", result.refreshToken, { maxAge: 1000 * 60 * 120, httpOnly: true });
      res.cookie("accessToken", result.accessToken, { maxAge: 1000 * 60 * 120, httpOnly: true });

      return res.status(200).json({ message: "Auth Successful" });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user info" });
    }
  };
}
