// src/pages/index.tsx
import type { NextPage } from "next";
import Head from "next/head";
import Layout from "../components/Layout";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <Layout>
      <Head>
        <title>PhoneScreen.AI - Home</title>
        <meta
          name="description"
          content="PhoneScreen.AI - Streamline your recruitment process"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center py-20">
        <h1 className="text-4xl font-bold text-center">
          Welcome to <span className="text-blue-600">PhoneScreen.AI</span>
        </h1>
        <p className="mt-4 text-xl text-center">
          Streamline your recruitment process with automated phone screening.
        </p>
        <div className="mt-8">
          <Link
            href="/auth/signup"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Get Started
          </Link>
        </div>
      </main>
    </Layout>
  );
};

export default Home;
