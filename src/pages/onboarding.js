import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '@/components/PaymentForm';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { signIn, useSession } from 'next-auth/react'; // Add useSession

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession(); // Add this line

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/check-subscription')
        .then(res => res.json())
        .then(data => {
          if (data.hasActiveSubscription) {
            router.push('/jobs');
          } else {
            fetch('/api/user/get-onboarding-data')
              .then(res => res.json())
              .then(data => {
                setUser(data.user);
                setCompany(data.company);
                setLoading(false);
              })
              .catch(err => {
                console.error(err);
                router.push('/auth/signin');
              });
          }
        })
        .catch(err => {
          console.error(err);
          router.push('/auth/signin');
        });
    } else if (status === 'unauthenticated') {
      const { token } = router.query;
      if (token) {
        fetch('/api/user/get-onboarding-data', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(async (data) => {
            setUser(data.user);
            setCompany(data.company);
            setLoading(false);
            if (data.hasActiveSubscription) {
              // Sign in the user before redirecting
              const result = await signIn('credentials', {
                email: data.user.email,
                password: token, // Use the token as a temporary password
                redirect: false,
              });
              if (result.ok) {
                router.push('/jobs');
              } else {
                console.error('Sign in failed:', result.error);
              }
            }
          })
          .catch(err => {
            console.error(err);
            router.push('/auth/signin');
          });
      } else {
        router.push('/auth/signin');
      }
    }
  }, [router, status]);

  if (loading) {
    return <Layout><div>Loading...</div></Layout>;
  }

  const handlePaymentSuccess = async () => {
    // Sign in the user after successful payment
    const result = await signIn('credentials', {
      email: user.email,
      password: router.query.token, // Use the token as a temporary password
      redirect: false,
    });
    if (result.ok) {
      router.push('/jobs');
    } else {
      console.error('Sign in failed:', result.error);
    }
  };

  return (
    <Layout>
      <div className="container py-12 space-y-8">
        <h1 className="text-3xl font-bold">Complete Your Registration</h1>
        <p>Welcome {user.name}! Please add a payment method and subscribe to complete your registration.</p>
        <Elements stripe={stripePromise}>
          <PaymentForm user={user} company={company} onSuccess={handlePaymentSuccess} />
        </Elements>
      </div>
    </Layout>
  );
}