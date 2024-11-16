import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function withActiveSubscription(WrappedComponent) {
  return function WithActiveSubscriptionComponent(props) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function checkSubscription() {
        try {
          const res = await fetch('/api/user/check-subscription');
          const data = await res.json();
          
          if (data.error) {
            router.push('/auth/signin');
            return;
          }

          // Allow access if user has active subscription OR is a white-label user
          if (!data.hasActiveSubscription && !data.isWhiteLabel) {
            router.push('/onboarding');
            return;
          }

          setLoading(false);
        } catch (error) {
          console.error('Error checking subscription:', error);
          router.push('/auth/signin');
        }
      }

      if (status === 'authenticated') {
        checkSubscription();
      } else if (status === 'unauthenticated') {
        router.push('/auth/signin');
      }
    }, [status, router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };
}