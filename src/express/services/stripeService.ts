import Stripe from "stripe";

export class StripeService {
  constructor(private stripe: Stripe) {}

  public createStripeCustomer = async (email: string): Promise<Stripe.Response<Stripe.Customer>> => {
    const customer = await this.stripe.customers.create({
      email: email,
    });
    return customer;
  };
}
