import { RequestHandler } from "express";
import { Controller } from "./Controller";
import { AuthService } from "../services/authSystemService";
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
import { authenticateToken } from "util/authenticateToken";
import { extractAccessToken } from "util/extractTokens";

export class AuthController extends Controller {
  constructor(private authService: AuthService) {
    super("/auth");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    // standart auth
    this.router.post("/sign-up", this.registration);
    // ---
    // google
    this.router.get("/google-auth", this.googleLink);
    this.router.get("/google-callback", this.googleCallback);
    this.router.get("/google-result", this.googleResult);
    // ---

    this.router.post("/login", this.login);
    this.router.post("/logout", extractAccessToken, authenticateToken, this.logout);
  };
  // standart auth -----------------------------------------------------------------------------------------------------
  private registration: RequestHandler = async (req, res) => {
    const { password, email: email } = req.body;
    const { accessToken, refreshToken } = await this.authService.registration({ email, password });

    res.cookie("refreshToken", refreshToken, { maxAge: 1000 * 60 * 120, httpOnly: true });
    res.cookie("accessToken", accessToken, { maxAge: 1000 * 60 * 120, httpOnly: true });

    return res.status(200).json({ message: "Registration successful" });
  };

  private login: RequestHandler = async (req, res) => {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await this.authService.login({ email, password });

    res.cookie("refreshToken", refreshToken, { maxAge: 1000 * 60 * 120, httpOnly: true });
    res.cookie("accessToken", accessToken, { maxAge: 1000 * 60 * 120, httpOnly: true });

    return res.status(200).json({ message: "Login successful" });
  };

  private logout: RequestHandler = async (req, res) => {
    res.cookie("refreshToken", { maxAge: -1, httpOnly: true });
    res.cookie("accessToken", { maxAge: -1, httpOnly: true });

    res.redirect("/main");
  };

  // -----------------------------------------------------------------------------------------------------
  // Google -----------------------------------------------------------------------------------------------------
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

      res.redirect(`/auth/google-result?token=${accessToken}`);
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

      const { id: googleId, email, name } = userInfo;
      const { accessToken, refreshToken } = await this.authService.googleAuth({ googleId, email, name });

      res.cookie("refreshToken", refreshToken, { maxAge: 1000 * 60 * 120, httpOnly: true });
      res.cookie("accessToken", accessToken, { maxAge: 1000 * 60 * 120, httpOnly: true });

      return res.status(200).json({ message: "Auth Successful" });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user info" });
    }
  };
  // -----------------------------------------------------------------------------------------------------
}
