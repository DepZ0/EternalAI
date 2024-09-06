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

  public async updatePaymentMethod(stripeCustomerId: string, paymentMethodId: string) {
    // Привязка нового метода оплаты к пользователю
    await this.stripe.paymentMethods.attach(paymentMethodId, { customer: stripeCustomerId });

    // Обновление метода оплаты по умолчанию для клиента
    await this.stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  }

  public cancelSubscriptionAtPeriodEnd = async (
    subscriptionId: string
  ): Promise<Stripe.Response<Stripe.Subscription>> => {
    try {
      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true, // We cancel the extension after the current period
      });

      return updatedSubscription;
    } catch (error) {
      console.error("Error canceling subscription renewal:", error);
      throw error;
    }
  };
}
