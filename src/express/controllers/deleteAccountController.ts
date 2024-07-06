import { RequestHandler } from "express";
import { Controller } from "./Controller";
import { DeleteAccountService } from "../services/deleteAccountService";
import { authenticateToken, RequestWithUser } from "../../util/authenticateToken";

export class DeleteAccountController extends Controller {
  constructor(private deleteAccountService: DeleteAccountService) {
    super("/account-delete");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.delete("/", authenticateToken, this.deleteAccount);
  };

  private deleteAccount: RequestHandler = async (req: RequestWithUser, res) => {
    const userId = Number(req.user?.id);
    await this.deleteAccountService.deleteAccount(userId);

    return res.status(200).json({ message: "Account deleted successfully" });
  };
}
