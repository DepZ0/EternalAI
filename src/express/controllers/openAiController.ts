import { OpenAiService } from "express/services/openAiService";
import { Controller } from "./Controller";
import { RequestHandler } from "express";
import { authenticateToken, RequestWithUser } from "util/authenticateToken";
import { extractAccessToken } from "util/extractTokens";

export class OpenAiController extends Controller {
  constructor(private openAiService: OpenAiService) {
    super("/");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post("/:famousPerson", extractAccessToken, authenticateToken, this.chatWithFamousPerson);
    this.router.delete(
      "/:famousPerson/clear-chat-history",
      extractAccessToken,
      authenticateToken,
      this.clearMessageHistory
    );
  };

  private chatWithFamousPerson: RequestHandler = async (req: RequestWithUser, res) => {
    const roles: Record<string, string> = {
      "steve-jobs": "Imagine you are Steve Jobs and talk to me. Say nothing about your tech side as ChatGPT",
      "stephan-bandera": "Imagine you are Stephan Bandera and talk to me. Say nothing about your tech side as ChatGPT",
      "britney-spears": "Imagine you are Britney Spears and talk to me. Say nothing about your tech side as ChatGPT",
      "joanne-rowling": "Imagine you are Joanne Rowling and talk to me. Say nothing about your tech side as ChatGPT",
      "elon-musk": "Imagine you are Elon Musk and talk to me. Say nothing about your tech side as ChatGPT",
    };

    const famousPerson = req.params.famousPerson;
    const roleMsg = roles[famousPerson];
    const userId = Number(req.user?.id);

    if (!roleMsg) {
      return res.status(400).send({ error: "Invalid famous person" });
    }

    const messageText = req.body.message;

    if (!messageText) {
      return res.status(400).send({ error: "Message is required" });
    }

    try {
      const result = await this.openAiService.sendMessage({ userId, messageText, roleMsg, famousPerson });
      return res.status(200).json(result);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Failed to process request" });
    }
  };

  private clearMessageHistory: RequestHandler = async (req: RequestWithUser, res) => {
    const userId = Number(req.user?.id);
    const famousPerson = req.params.famousPerson;

    try {
      const result = await this.openAiService.clearMessageHistory({ userId, famousPerson });
      return res.status(200).json(`Messages history from chat '${famousPerson}' was deleted`);
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Failed to process request" });
    }
  };
}
