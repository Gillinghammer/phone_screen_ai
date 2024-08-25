import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { LoginForm } from "../../components/LoginForm";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SignIn() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user/check-subscription')
        .then(res => res.json())
        .then(data => {
          if (data.hasActiveSubscription) {
            router.push("/jobs");
          } else {
            router.push("/onboarding");
          }
        })
        .catch(err => {
          console.error(err);
          // Handle error (e.g., show error message)
        });
    }
  }, [status, router]);

  if (status === 'loading') {
    return <Layout><div>Loading...</div></Layout>;
  }

  if (status === 'authenticated') {
    return <Layout><div>Redirecting...</div></Layout>;
  }

  return (
    <Layout>
      <LoginForm />
    </Layout>
  );
}