import Stripe from "stripe";

export class StripeService {
  constructor(private stripe: Stripe) {}

  public createStripeCustomer = async (email: string): Promise<Stripe.Response<Stripe.Customer>> => {
    const customer = await this.stripe.customers.create({
      email: email,
    });
    return customer;
  };

  public getStripePaymentLink = async (stripeCustomerId: string) => {
    const result = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      line_items: [
        {
          price: "price_1Pbip8LbBDX36PAywNi39Dn5",
          quantity: 1,
        },
      ],
      success_url: "http://localhost:3000/success",
      // return_url: "http://localhost:3000/return",
    });
    return result;
  };
}
