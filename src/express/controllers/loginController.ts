import { RequestHandler } from "express";
import { Controller } from "./Controller";
import { LoginService } from "../services/loginService";

export class LoginController extends Controller {
  constructor(private loginService: LoginService) {
    super("/login");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post("/", this.login);
  };

  private login: RequestHandler = async (req, res) => {
    const { email, password } = req.body;
    const userAgent = req.headers["user-agent"] || "unknown";
    const result = await this.loginService.login(userAgent, email, password);

    if (result?.error) {
      return res.status(400).json({ error: result.error });
    }
    res.cookie("refreshToken", result.refreshToken, { maxAge: 1000 * 60 * 120, httpOnly: true });
    res.cookie("accessToken", result.accessToken, { maxAge: 1000 * 60 * 120, httpOnly: true });
    return res.status(200).json({ response: "Login successful" });
  };
}
