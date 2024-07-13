import Stripe from "stripe";

export async function createStripeCustomer(email) {
  try {
    const customer = await stripe.customers.create({
      email: email,
    });
  } catch (error) {
    return error;
  }
}
