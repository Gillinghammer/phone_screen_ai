// pages/subscribe.js
import { useState } from "react";
import Layout from "../components/Layout";
import { getSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { prisma } from '../lib/prisma';

export async function getServerSideProps(context) {
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

  return {
    props: {
      user,
    },
  };
}

export default function Subscribe({ user }) {
  const email = user.email;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscriptionId, setSubscriptionId] = useState(null);

  const handleSubscribe = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError(null);
    setSubscriptionId(null);

    try {
      const response = await fetch("/api/billing/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }

      const { subscriptionId } = await response.json();

      setSubscriptionId(subscriptionId);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1>Subscribe</h1>
      <p>Subscribe to our service to get access to premium features.</p>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Button onClick={handleSubscribe}>Subscribe</Button>
          {error && <p>Error: {error}</p>}
          {subscriptionId && <p>Subscription ID: {subscriptionId}</p>}
        </>
      )}
    </Layout>
  );
}
