import { RequestHandler } from "express";
import { Controller } from "./Controller";
import { RegistrationService } from "../services/registrationService";

export class RegistrationController extends Controller {
  constructor(private registrationService: RegistrationService) {
    super("/sign-up");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post("/", this.registration);
  };

  private registration: RequestHandler = async (req, res) => {
    const { password, email: email } = req.body;
    const result = await this.registrationService.registration(email, password);

    if (result?.error) {
      return res.status(400).json({ error: result.error });
    }

    return res.status(200).json("Registration successful");
  };
}
