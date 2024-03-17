// pages/dashboard.tsx
import { useSession, getSession } from "next-auth/react";
import Layout from "../../components/Layout";
import { GetServerSideProps } from "next";
import { PrismaClient } from "@prisma/client";
import { useState } from "react";
import Link from "next/link";

const prisma = new PrismaClient();

const Dashboard = ({ jobs }) => {
  const { data: session, status } = useSession();
  console.log("Client Session:", session, status);
  const [jobDetails, setJobDetails] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary: "",
    publicUrl: "",
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>You must be signed in to view this page.</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobDetails({ ...jobDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/create-job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobDetails),
      credentials: "include",
    });

    if (response.ok) {
      // You might want to update the UI to reflect the new job
      alert("Job added successfully!");
    } else {
      alert("Failed to add job.");
    }
  };

  const handleUrlChange = async (e) => {
    const url = e.target.value;
    setJobDetails({ ...jobDetails, publicUrl: url });

    if (url) {
      try {
        const response = await fetch("/api/scrape-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });

        if (response.ok) {
          const scrapedData = await response.json();
          setJobDetails({ ...jobDetails, ...scrapedData });
        }
      } catch (error) {
        console.error("Failed to scrape URL:", error);
      }
    }
  };

  if (!session) {
    // If there is no session (user not signed in), we can show a message or redirect to sign-in page
    return <p>Access denied. You need to be signed in to view this page.</p>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

        {/* Job Listings Table */}
        <div className="mt-6">
          <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Applicants
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Qualified
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50"></th>{" "}
                  {/* View Page */}
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50"></th>{" "}
                  {/* Edit */}
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50"></th>{" "}
                  {/* Archive */}
                </tr>
              </thead>
              <tbody className="bg-white">
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                      <Link href={`/jobs/${job.id}`}>
                        <span className="text-lg leading-5 text-blue-500 hover:text-blue-800">
                          {job.title}
                        </span>
                      </Link>
                    </td>
                    {/* Populate other cells with relevant data */}
                    {/* ... */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Post New Job Form */}
        <div className="mt-10">
          <form
            onSubmit={handleSubmit}
            className="md:grid md:grid-cols-2 md:gap-6"
          >
            {/* Left Column */}
            <div className="mb-6 md:mb-0">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={jobDetails.title}
                onChange={handleInputChange}
              />

              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mt-4"
              >
                Location
              </label>
              <input
                type="text"
                name="location"
                id="location"
                required
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={jobDetails.location}
                onChange={handleInputChange}
              />
            </div>

            {/* Right Column */}
            <div>
              <label
                htmlFor="salary"
                className="block text-sm font-medium text-gray-700"
              >
                Salary
              </label>
              <input
                type="text"
                name="salary"
                id="salary"
                required
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                value={jobDetails.salary}
                onChange={handleInputChange}
              />

              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mt-4"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                required
                rows={3}
                className="mt-1 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md"
                value={jobDetails.description}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label
                htmlFor="requirements"
                className="block text-sm font-medium text-gray-700 mt-4"
              >
                Requirements
              </label>
              <textarea
                name="requirements"
                id="requirements"
                required
                rows={3}
                className="mt-1 block w-full shadow-sm sm:text-sm border border-gray-300 rounded-md"
                value={jobDetails.requirements}
                onChange={handleInputChange}
              />
            </div>
            {/* Action Buttons */}
            <div className="mt-6 md:col-span-2">
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Post Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    // If not authenticated, redirect to sign-in page
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
      userId: user.id,
    },
    select: {
      id: true,
      jobTitle: true,
      jobDescription: true,
      jobLocation: true,
    },
  });

  return {
    props: { jobs }, // will be passed to the page component as props
  };
};

export default Dashboard;
