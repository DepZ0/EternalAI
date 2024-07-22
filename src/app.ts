import express, { Application } from "express";
import { Controller } from "./express/controllers/Controller";
import { ZodError } from "zod";
import "express-async-errors";
import cors from "cors";
import cookieParser from "cookie-parser";
import { BadRequestError } from "./util/customErrors";

export class App {
  public app: Application;
  constructor(private port: number, private controllers: Controller[]) {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeControllers();
  }

  private initializeMiddlewares = () => {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(cookieParser());
  };

  private initializeControllers = () => {
    this.controllers.forEach((controller) => {
      this.app.use(controller.path, controller.router);
    });

    this.app.use((err: any, req: any, res: any, next: any) => {
      console.error(err.stack);

      if (err instanceof BadRequestError) return res.status(400).json({ error: err.message });

      if (err instanceof ZodError) {
        return res.status(422).json({ error: err.message });
      }

      return res.status(500).json({ error: "Something went wrong" });
    });
  };

  public start = () => {
    this.app.listen(this.port, () => {
      console.log(`The server is running on port ${this.port}`);
    });
  };
}
