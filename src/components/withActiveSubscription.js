import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function withActiveSubscription(WrappedComponent) {
  return function WithActiveSubscriptionComponent(props) {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      if (status === 'authenticated') {
        fetch('/api/user/check-subscription')
          .then(res => res.json())
          .then(data => {
            if (!data.hasActiveSubscription) {
              router.push('/onboarding');
            } else {
              setLoading(false);
            }
          })
          .catch(err => {
            console.error(err);
            router.push('/auth/signin');
          });
      } else if (status === 'unauthenticated') {
        router.push('/auth/signin');
      }
    }, [status, router]);

    if (loading || status === 'loading') {
      return <div>Loading...</div>;
    }

    return <WrappedComponent {...props} />;
  };
}