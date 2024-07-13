import { RequestHandler } from "express";
import { Controller } from "./Controller";
import { AuthService } from "../services/authSystemService";
import { messages } from "../../schema";

export class AuthController extends Controller {
  constructor(private authService: AuthService) {
    super("/auth");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post("/sign-up", this.registration);
  };

  private registration: RequestHandler = async (req, res) => {
    const { password, email: email } = req.body;
    const { accessToken, refreshToken } = await this.authService.registration({ email, password });

    return res.status(200).json({ message: "Registration successful", accessToken, refreshToken });
  };
}
