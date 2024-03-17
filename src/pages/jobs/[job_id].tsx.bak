// pages/jobs/[job_id].tsx
import { useState } from "react";
import { PrismaClient } from "@prisma/client";
import { GetServerSideProps } from "next";

const prisma = new PrismaClient();

const JobPage = ({ job }) => {
  const [applicantDetails, setApplicantDetails] = useState({
    name: "",
    email: "",
    phone: "",
    resumeUrl: "",
    jobId: job.id,
  });
  console.log("job", job);
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setApplicantDetails({ ...applicantDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...applicantDetails, jobId: job.id }),
      });

      if (response.ok) {
        // Clear form or show success message
        setApplicantDetails({
          name: "",
          email: "",
          phone: "",
          resumeUrl: "",
          jobId: job.id,
        });
        alert("Application submitted successfully!");
      } else {
        // Handle error, show an error message
        alert("Failed to submit application.");
      }
    } catch (error) {
      // Handle the error, show an error message
      console.error("An error occurred while submitting the form:", error);
      alert("An error occurred while submitting the application.");
    }
  };

  return (
    <div>
      {/* ... existing job page JSX ... */}
      <form onSubmit={handleSubmit} className="w-full max-w-lg my-5">
        <div className="flex flex-wrap -mx-3 mb-6">
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
              id="name"
              type="text"
              placeholder="Jane Doe"
              name="name"
              value={applicantDetails.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="w-full md:w-1/2 px-3">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
              id="email"
              type="email"
              placeholder="jane.doe@example.com"
              name="email"
              value={applicantDetails.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="phone"
            >
              Phone
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
              id="phone"
              type="text"
              placeholder="+1234567890"
              name="phone"
              value={applicantDetails.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="w-full md:w-1/2 px-3">
            <label
              className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
              htmlFor="resumeUrl"
            >
              Resume URL (optional)
            </label>
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white"
              id="resumeUrl"
              type="url"
              placeholder="http://linkedin.com/in/jane-doe"
              name="resumeUrl"
              value={applicantDetails.resumeUrl}
              onChange={handleInputChange}
            />
          </div>
          <div className="w-full px-3 text-right">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Apply
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { job_id } = context.params;

  const job = await prisma.job.findUnique({
    where: { id: parseInt(job_id as string) },
    select: {
      id: true,
      jobTitle: true,
      jobLocation: true,
      jobDescription: true,
      remoteFriendly: true,
      seniority: true,
      salary: true,
      company: true,
      requirements: true,
      interviewQuestions: true,
      responsibilities: true,
    },
  });

  if (!job) {
    return {
      notFound: true,
    };
  }

  return {
    props: { job },
  };
};

export default JobPage;
