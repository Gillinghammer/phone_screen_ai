import { useRouter } from "next/router";
import Layout from "../../components/Layout"; // Make sure the path to Layout is correct
import {LoginForm} from "../../components/LoginForm";
import { signIn, useSession } from "next-auth/react";

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();

  if (session) {
    router.push("/jobs");
  }

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
}
