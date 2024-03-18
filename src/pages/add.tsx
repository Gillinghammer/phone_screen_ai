// pages/jobs.tsx
import Layout from "../components/Layout";
import AddJob from "../components/AddJob";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const JobsPage = ({ jobs }) => {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h3 className="text-2xl font-semibold text-gray-900">Post a New Job</h3>
        <AddJob />
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
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
  });

  const jobs = await prisma.job.findMany({
    where: {
      userId: user?.id,
    },
    select: {
      id: true,
      jobTitle: true,
    },
  });

  return {
    props: { jobs },
  };
};

export default JobsPage;
