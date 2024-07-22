import { RequestHandler } from "express";
import { Controller } from "./Controller";
import fs from "fs";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { stripeEvents, subscriptions, users } from "schema";
import { eq } from "drizzle-orm";

type InvoicePaidWebhook = {
  data: {
    object: {
      id: string;
      customer: string;
      customer_email: string;
      created: number;
      lines: {
        data: [
          {
            period: {
              start: number;
              end: number;
            };
          }
        ];
      };
    };
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
  constructor(private db: NodePgDatabase) {
    super("/webhook");
    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post("/stripe", this.stripeWebhook);
  };

  private stripeWebhook: RequestHandler<{}, {}, StripeWebhookEvent> = async (req, res) => {
    const body = req.body;
    switch (body.type) {
      case "customer.deleted":
        body.data.name;
        await this.stripeCustomerDeleted(body);
        break;
      case "invoice.paid":
        body.data.object.id;
        await this.stripeInvoicePaid(body);
        break;
    }

    res.status(200).send("OK");
  };

  private stripeInvoicePaid = async (body: InvoicePaidWebhook) => {
    // Create Events in DataBase
    const stripeBody = {
      eventId: body.data.object.id,
      type: body.type,
      data: JSON.stringify(body),
    };
    await this.db.insert(stripeEvents).values(stripeBody);
    // ------------------------------
    const user = await this.db.select().from(users).where(eq(users.stripeCustomerId, body.data.object.customer));

    const subscriptionsObject = {
      userId: user[0].id,
      endDate: new Date(body.data.object.lines.data[0].period.end * 1000),
    };
    await this.db.insert(subscriptions).values(subscriptionsObject);

    return;
  };

  private stripeCustomerDeleted = async (body: CustomerDeletedWebhook) => {
    // logic here
    return;
  };
}
