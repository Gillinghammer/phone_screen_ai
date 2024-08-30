import stripe from "../../../lib/stripe";
import prisma from "../../../lib/prisma";

const PRICE_ID = process.env.STRIPE_PRICE_ID;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { paymentMethodId, company, user } = req.body;
    const plan = req.body.plan || 'Basic';
    const product = req.body.product || 'Screening Plan';

    try {
      // Create a customer in Stripe
      const customer = await stripe.customers.create({
        name: user.name,
        email: user.email,
        metadata: {
          phoneScreenUserId: user.id,
          company: company.name,
          domain: company.domain
        }
      });

      // Attach the payment method to the customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      // Set it as the default payment method
      await stripe.customers.update(customer.id, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      // Create a subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: PRICE_ID }],
        expand: ['latest_invoice.payment_intent'],
      });

      // Create a new subscription in the database
      const newSubscription = await prisma.subscription.create({
        data: {
          companyId: company.id,
          stripeSubscriptionId: subscription.id,
          status: 'ACTIVE',
          plan,
          product,
          startDate: new Date(),
        },
      });

      // Update the company's stripeSubscriptionIds array
      await prisma.company.update({
        where: { id: company.id },
        data: {
          stripeCustomerId: customer.id,
          stripeSubscriptionIds: {
            push: subscription.id,
          },
        },
      });

      res.status(200).json({ success: true, subscriptionId: subscription.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while setting up the subscription.' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}