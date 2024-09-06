import Stripe from "stripe";
import "dotenv/config";

const stripe = new Stripe(`${process.env.STRIPE_SECRET}`);

async function updatePaymentMethod(customerId: string) {
  try {
    // Используем тестовый токен Mastercard
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        token: "tok_visa", // Тестовый токен для карты Mastercard
      },
    });

    // Привязываем PaymentMethod к клиенту
    // await stripe.paymentMethods.attach(paymentMethod.id, {
    //   customer: customerId,
    // });

    // Обновляем дефолтный метод оплаты для клиента
    // await stripe.customers.update(customerId, {
    //   invoice_settings: {
    //     default_payment_method: paymentMethod.id,
    //   },
    // });

    console.log("Payment method updated successfully:", paymentMethod.id);
    return paymentMethod.id;
  } catch (error) {
    console.error("Error updating payment method:", error);
    throw error;
  }
}

// Пример вызова функции с customerId
updatePaymentMethod("cus_QlNqLcCLxO0Nrw");
