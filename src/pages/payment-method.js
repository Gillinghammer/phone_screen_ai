import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "@/components/PaymentForm"; // Update the import statement
import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();

  const session = await getSession(context);

  if (!session || !session.user?.email) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
      email: true,
      companyId: true,
      name: true,
    },
  });

  const company = await prisma.company.findUnique({
    where: {
      id: user.companyId,
    },
    select: {
      id: true,
      name: true,
      domain: true,
      stripeSubscriptionIds: true,
      stripeCustomerId: true,
    },
  });

  return {
    props: {
      user,
      company,
    },
  };
}

const PaymentMethod = ({ user, company }) => (
  <div className="container">
    <div className="py-12 space-y-4">
      <h1>Payment Method</h1>
      <Elements stripe={stripePromise}>
        <PaymentForm user={user} company={company} />
      </Elements>
    </div>
  </div>
);

export default PaymentMethod;
