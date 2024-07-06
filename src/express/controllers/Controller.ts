import { Router } from "express";

export abstract class Controller {
  public router: Router;
  constructor(public path: string) {
    this.router = Router();
  }
}
