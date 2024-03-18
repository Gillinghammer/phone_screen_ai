import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout"; // Make sure the path to Layout is correct

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { data: session } = useSession();
  const router = useRouter();

  // Redirect if user is already logged in
  if (session) {
    router.push("/jobs");
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    signIn("credentials", {
      email,
      password,
      redirect: false, // Set redirect to false to handle redirecting here
    }).then((result) => {
      if (result.error) {
        alert(result.error);
      } else {
        // Redirect to the /jobs
        router.push(result.url || "/jobs");
      }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6 bg-white shadow-md rounded px-10 pt-6 pb-8 mb-4"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                placeholder="••••••••"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
