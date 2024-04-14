// components/AddJob.tsx
import { useState } from "react";

const AddJob = ({ user }) => {
  const [jobPost, setJobPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const handleJobPostChange = (e) => {
    setJobPost(e.target.value);
  };

  console.log("debug add job");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingMessage("Our AI is processing your job post...");

    try {
      // Call the parse-job endpoint
      const parseResponse = await fetch("/api/parse-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ details: jobPost }),
      });

      if (!parseResponse.ok) {
        throw new Error("Failed to parse job post");
      }

      const parsedJob = await parseResponse.json();

      // Extract the necessary fields from the parsed job
      const {
        companyId,
        jobTitle,
        jobLocation,
        jobDescription,
        remoteFriendly,
        seniority,
        salary,
        requirements,
        responsibilities,
        interviewQuestions,
      } = parsedJob;

      // Call the create-job endpoint
      const createResponse = await fetch("/api/create-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyId,
          jobTitle,
          jobLocation,
          jobDescription,
          remoteFriendly,
          seniority,
          salary,
          requirements,
          responsibilities,
          interviewQuestions,
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create job");
      }

      // Simulate the processing time with timeouts
      setTimeout(() => {
        setLoadingMessage(
          "Now we're generating interview questions used to qualify candidates"
        );
        setTimeout(() => {
          setIsLoading(false);
          alert(
            "Processing complete! You can now review and edit the job details and interview questions."
          );
        }, 5000);
      }, 5000);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex">
      <aside className="w-1/3 p-6 bg-gray-100">
        <h3 className="text-sm font-semibold mb-2">How to Add a Job</h3>
        <p className="text-sm mb-4">
          Follow the steps below to add a new job listing:
        </p>
        <ol className="text-sm list-decimal list-inside mb-4 space-y-4">
          <li>Copy the job listing text from your careers page.</li>
          <li>Paste it into the text area on this page.</li>
          <li>Click Generate Job Listing to proceed.</li>
          <li>
            Our AI will parse the details and generate interview questions.
          </li>
          <li>
            You can review and edit the information before finalizing the job
            post.
          </li>
          <li>
            Once submitted, you will get a link to share with candidates or post
            online.
          </li>
        </ol>
        <p className="text-sm">
          Candidates will go through an automated screening call, and you will
          receive a qualification score to help filter applications.
        </p>
      </aside>

      <div className="w-2/3 p-2">
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full h-96 p-4 border border-gray-300 rounded-lg text-xs"
            placeholder="Paste the job listing here..."
            value={jobPost}
            onChange={handleJobPostChange}
          />
          <button
            type="submit"
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading || !jobPost}
          >
            {isLoading ? "Processing..." : "Generate Job Listing"}
          </button>
        </form>
      </div>
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="text-white text-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
            <h2 className="text-xl font-semibold">
              Processing your job post...
            </h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddJob;
