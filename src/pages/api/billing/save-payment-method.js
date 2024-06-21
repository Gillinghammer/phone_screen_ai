import stripe from "../../../lib/stripe";
import prisma from "../../../lib/prisma";

const PRICE_ID = "price_1PLygM08WrQYH15OLDhVfjsH";

const handler = async (req, res) => {
  if (req.method === "POST") {
    const { paymentMethodId, companyId, userId } = req.body;

    // Attach the payment method to a customer
    const customer = await stripe.customers.create();
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set the default payment method on the customer
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create a subscription with metered billing
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: PRICE_ID,
        },
      ],
      expand: ["latest_invoice.payment_intent"],
    });

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        stripeSubscriptionIds: {
          push: subscription.id,
        },
        stripeCustomerId: customer.id,
      },
    });

    res.status(200).json({
      customerId: customer.id,
      subscriptionId: subscription.id,
      company: updatedCompany,
    });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};

export default handler;
