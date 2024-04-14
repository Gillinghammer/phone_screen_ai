import { useRouter } from "next/router";
import Layout from "../../components/Layout"; // Make sure the path to Layout is correct
import { LoginForm } from "../../components/LoginForm";
import { signIn, useSession } from "next-auth/react";

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    router.push("/jobs");
  }

  return (
    <Layout>
      <LoginForm />
    </Layout>
  );
}
