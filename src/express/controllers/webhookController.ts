import { RequestHandler } from "express";
import { Controller } from "./Controller";
import fs from "fs";

type InvoicePaidWebhook = {
  data: {
    id: 1;
  };
  type: "invoice.paid";
};
type CustomerDeletedWebhook = {
  data: {
    name: "true";
  };
  type: "customer.deleted";
};
type StripeWebhookEvent = CustomerDeletedWebhook | InvoicePaidWebhook;

export class WebhookController extends Controller {
  constructor() {
    super("/webhook");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post("/stripe", this.stripeWebhook);
  };

  private stripeWebhook: RequestHandler<{}, {}, StripeWebhookEvent> = async (req, res) => {
    // return status 200 always
    // СОздать таблицу с эвентами и сохранять все эвенты(боди) которые приходят в базу
    // Чекать вид эвента и (изучить что приходит в ответе)
    const body = req.body;
    switch (body.type) {
      case "customer.deleted":
        body.data.name;
        await this.stripeCustomerDeleted(body);
        break;
      case "invoice.paid":
        body.data.id;
        await this.stripeInvoicePaid(body);
        break;
    }

    fs.writeFileSync("result.json", JSON.stringify(req.body));
    res.status(200).send("OK");
  };

  private stripeInvoicePaid = async (body: InvoicePaidWebhook) => {
    // logic here
    return;
  };

  private stripeCustomerDeleted = async (body: CustomerDeletedWebhook) => {
    // logic here
    return;
  };
}
