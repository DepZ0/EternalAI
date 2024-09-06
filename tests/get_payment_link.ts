import Stripe from "stripe";
import "dotenv/config";

const stripe = new Stripe(`${process.env.STRIPE_SECRET}`);

async function getPaymentLink() {
  const paymentLink = await stripe.checkout.sessions.create({
    customer: "cus_QlNqLcCLxO0Nrw",
    mode: "subscription",
    line_items: [
      {
        price: "price_1Pbip8LbBDX36PAywNi39Dn5",
        quantity: 1,
      },
    ],
    success_url: "http://localhost:3000/success",
  });

  return paymentLink.url;
}

async function printPaymentLink() {
  try {
    const paymentLink = await getPaymentLink();
    console.log(paymentLink); // Здесь мы выводим реальный результат
  } catch (error) {
    console.error("Error:", error);
  }
}

printPaymentLink();
