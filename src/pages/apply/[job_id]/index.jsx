import { useState } from "react";
import { PrismaClient } from "@prisma/client";
import ConfirmationModal from "../../../components/ConfirmationModal";
import { track } from "@vercel/analytics";
const prisma = new PrismaClient();

const JobPage = ({ job }) => {
  const [applicantDetails, setApplicantDetails] = useState({
    name: "",
    email: "",
    phone: "",
    resumeUrl: "",
    jobId: job.id,
  });
  console.log(job);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setApplicantDetails({ ...applicantDetails, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...applicantDetails, jobId: job.id, job }),
      });

      if (response.ok) {
        track('Candidate application', { ...applicantDetails, jobId: job.id, jobTitle: job.jobTitle, company: job.company});
        setApplicantDetails({
          name: "",
          email: "",
          phone: "",
          resumeUrl: "",
          jobId: job.id,
        });
        alert("Application submitted successfully!");
      } else {
        alert("Failed to submit application.");
      }
    } catch (error) {
      console.error("An error occurred while submitting the form:", error);
      alert("An error occurred while submitting the application.");
    }
  };

  return (
    <div className="bg-foreground text-gray-900 min-h-screen flex items-center justify-center p-10">
      <div className="bg-gray-50 container mx-auto rounded shadow-md overflow-hidden max-w-4xl">
        <div className="md:flex">
          <div className="md:w-1/2 p-5 border-r">
            <h1 className="text-2xl font-bold">
              {job.jobTitle} at {job.company?.name}
            </h1>
            <div className="mb-5">
              <h2 className="font-semibold">Location</h2>
              <p className="text-gray-600">
                {job.jobLocation}{" "}
                {job.remoteFriendly ? "(Remote friendly)" : ""}
              </p>
            </div>
            <div className="mb-5">
              <h2 className="font-semibold">Job Description</h2>
              <p className="text-sm">{job.jobDescription}</p>
            </div>
            <div className="mb-5">
              <h2 className="font-semibold">Seniority</h2>
              <p className="text-sm">{job.seniority}</p>
            </div>
          </div>
          <div className="md:w-1/2 p-5">
            <form className="space-y-4">
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Full name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={applicantDetails.name}
                  onChange={handleInputChange}
                  required
                  className="bg-white mt-1 p-2 border border-gray-300 rounded-md shadow-sm w-full"
                  placeholder="Jane Doe"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={applicantDetails.email}
                  onChange={handleInputChange}
                  required
                  className="bg-white mt-1 p-2 border border-gray-300 rounded-md shadow-sm w-full"
                  placeholder="jane.doe@example.com"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone number
                </label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={applicantDetails.phone}
                  onChange={handleInputChange}
                  required
                  className="bg-white mt-1 p-2 border border-gray-300 rounded-md shadow-sm w-full"
                  placeholder="+1234567890"
                />
              </div>
              {/* <div className="mb-4">
                <label
                  htmlFor="resumeUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  LinkedIn URL (optional)
                </label>
                <input
                  type="url"
                  name="resumeUrl"
                  id="resumeUrl"
                  value={applicantDetails.resumeUrl}
                  onChange={handleInputChange}
                  className="bg-white mt-1 p-2 border border-gray-300 rounded-md shadow-sm w-full"
                  placeholder="http://linkedin.com/in/jane-doe"
                />
              </div> */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  disabled={
                    applicantDetails.name === "" ||
                    applicantDetails.email === "" ||
                    applicantDetails.phone === ""
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply for this job
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ConfirmationModal
        company={job.company.name}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {
          setIsModalOpen(false);
          handleSubmit(); // Call your form submission function here
        }}
      />
    </div>
  );
};

export const getServerSideProps = async (context) => {
  const { job_id } = context.params;

  const job = await prisma.job.findUnique({
    where: { id: parseInt(job_id) },
    select: {
      id: true,
      jobTitle: true,
      jobLocation: true,
      jobDescription: true,
      remoteFriendly: true,
      seniority: true,
      salary: true,
      company: {
        select: {
          name: true,
        },
      },
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
