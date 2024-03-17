// components/AddJob.tsx
import { useState } from "react";
import { ArchiveBoxIcon } from "@heroicons/react/24/outline";

const mockData = {
  company: "PhoneScreen.AI",
  job_title: "Full Stack Developer",
  job_location: "fully remote",
  job_description:
    "Strong proficiency in JavaScript\nExperience with React and Node.js\nFamiliarity with MongoDB and RESTful APIs\nExcellent communication skills",
  remote_friendly: true,
  seniority: "Full Stack Developer",
  salary: 145000,
  requirements: [
    "Strong proficiency in JavaScript",
    "Experience with React and Node.js",
    "Familiarity with MongoDB and RESTful APIs",
    "Excellent communication skills",
  ],
  responsibilities: [
    "Develop and maintain web applications.",
    "Collaborate with cross-functional teams.",
    "Ensure high performance and responsiveness.",
    "Have strong proficiency in JavaScript.",
    "Have experience with React and Node.js.",
    "Be familiar with MongoDB and RESTful APIs.",
    "Possess excellent communication skills.",
  ],
  interview_questions: [
    "What experience do you have with React, Node.js, and MongoDB?",
    "Can you provide examples of web applications you have developed and maintained in the past?",
    "How do you collaborate with cross-functional teams on projects?",
    "What steps do you take to ensure high performance and responsiveness in web applications you develop?",
    "Please describe your proficiency in JavaScript and how you have utilized it in your previous projects.",
    "Have you worked with RESTful APIs before? If so, can you give an example of a project you worked on?",
    "How comfortable are you with working in a fully remote position?",
    "Can you share an experience where your communication skills played a significant role in the success of a project?",
    "What motivates you to stay updated with the latest trends and technologies in Full Stack Development?",
    "How do you manage and prioritize your tasks when working on multiple projects simultaneously?",
  ],
};

const AddJob = () => {
  const [jobPost, setJobPost] = useState("");
  const [jobDetails, setJobDetails] = useState(mockData);
  const [isParsed, setIsParsed] = useState(false);

  const handleJobPostChange = (e) => {
    setJobPost(e.target.value);
  };

  const generateJobListing = async () => {
    try {
      const response = await fetch("/api/parse-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ details: jobPost }),
      });

      if (response.ok) {
        const data = await response.json();
        setJobDetails(data);
        setIsParsed(true);
      } else {
        throw new Error("Failed to parse job post");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobDetails({ ...jobDetails, [name]: value });
  };

  const createJob = async () => {
    try {
      const response = await fetch("/api/create-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobDetails),
      });

      if (response.ok) {
        alert("Job created successfully!");
      } else {
        throw new Error("Failed to create job");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      {!isParsed ? (
        <div>
          <textarea
            placeholder="Paste in your job post"
            value={jobPost}
            onChange={handleJobPostChange}
            rows={40}
            className="w-full p-2 border border-gray-300 rounded-md text-sm"
          ></textarea>
          <button
            onClick={generateJobListing}
            className="mt-2 p-2 bg-blue-500 text-white rounded-md"
          >
            Generate Job Listing
          </button>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="company"
                className="block text-lg text-gray-700 mb-1"
              >
                Company Name
              </label>
              <input
                type="text"
                name="company"
                placeholder="Company Name"
                value={jobDetails.company}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md mb-2 text-sm"
              />
              <label
                htmlFor="job_title"
                className="block text-lg text-gray-700 mb-1"
              >
                Job Title
              </label>
              <input
                type="text"
                name="job_title"
                placeholder="Job Title"
                value={jobDetails.job_title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md mb-2 text-sm"
              />
              <label
                htmlFor="job_location"
                className="block text-lg text-gray-700 mb-1"
              >
                Job Location
              </label>
              <input
                type="text"
                name="job_location"
                placeholder="Job Location"
                value={jobDetails.job_location}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md mb-2 text-sm"
              />
              <label
                htmlFor="job_description"
                className="block text-lg text-gray-700 mb-1"
              >
                Job Description
              </label>
              <textarea
                name="job_description"
                placeholder="Job Description"
                value={jobDetails.job_description}
                onChange={handleInputChange}
                rows={5}
                className="w-full p-2 border border-gray-300 rounded-md mb-2 text-sm"
              />
              <label
                htmlFor="remote_friendly"
                className="block text-lg text-gray-700 mb-1"
              >
                Remote Friendly
              </label>
              <input
                type="checkbox"
                id="remote_friendly"
                name="remote_friendly"
                checked={jobDetails.remote_friendly}
                onChange={(e) =>
                  setJobDetails({
                    ...jobDetails,
                    remote_friendly: e.target.checked,
                  })
                }
                className="hidden" // Hide the default checkbox
              />
              <label
                htmlFor="remote_friendly"
                className={`relative inline-block w-12 h-6 bg-gray-300 rounded-full cursor-pointer ${
                  jobDetails.remote_friendly ? "bg-blue-300" : ""
                }`}
              >
                <span
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    jobDetails.remote_friendly ? "translate-x-6" : ""
                  }`}
                ></span>
              </label>
            </div>
            <div>
              <label
                htmlFor="seniority"
                className="block text-lg text-gray-700 mb-1"
              >
                Seniority
              </label>
              <input
                type="text"
                name="seniority"
                placeholder="Seniority"
                value={jobDetails.seniority}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md mb-2 text-sm"
              />
              <label
                htmlFor="salary"
                className="block text-lg text-gray-700 mb-1"
              >
                Salary
              </label>
              <input
                type="text"
                name="salary"
                placeholder="Salary"
                value={jobDetails.salary}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md mb-2 text-sm"
              />
              <div className="col-span-2">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Job Requirements
                  </h3>
                  {jobDetails.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="text"
                        name={`requirements_${index}`}
                        value={requirement}
                        onChange={(e) => {
                          const newRequirements = [...jobDetails.requirements];
                          newRequirements[index] = e.target.value;
                          setJobDetails({
                            ...jobDetails,
                            requirements: newRequirements,
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                      />
                      <button
                        onClick={() => {
                          const newRequirements =
                            jobDetails.requirements.filter(
                              (_, i) => i !== index
                            );
                          setJobDetails({
                            ...jobDetails,
                            requirements: newRequirements,
                          });
                        }}
                        className="ml-2 p-2 bg-red-500 text-white rounded-md"
                      >
                        <ArchiveBoxIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setJobDetails({
                        ...jobDetails,
                        requirements: [...jobDetails.requirements, ""],
                      })
                    }
                    className="p-2 bg-blue-500 text-white rounded-md"
                  >
                    Add Requirement
                  </button>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Responsibilities
                  </h3>
                  {jobDetails.responsibilities.map((responsibility, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        key={index}
                        type="text"
                        name={`responsibilities_${index}`}
                        value={responsibility}
                        onChange={(e) => {
                          const newResponsibilities = [
                            ...jobDetails.responsibilities,
                          ];
                          newResponsibilities[index] = e.target.value;
                          setJobDetails({
                            ...jobDetails,
                            responsibilities: newResponsibilities,
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md mb-2 text-sm"
                      />
                      <button
                        onClick={() => {
                          const newResponsibilities =
                            jobDetails.responsibilities.filter(
                              (_, i) => i !== index
                            );
                          setJobDetails({
                            ...jobDetails,
                            responsibilities: newResponsibilities,
                          });
                        }}
                        className="ml-2 p-2 bg-red-500 text-white rounded-md"
                      >
                        <ArchiveBoxIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setJobDetails({
                        ...jobDetails,
                        responsibilities: [...jobDetails.responsibilities, ""],
                      })
                    }
                    className="p-2 bg-blue-500 text-white rounded-md"
                  >
                    Add Responsibility
                  </button>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Interview Questions
                  </h3>
                  {jobDetails.interview_questions.map((question, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        key={index}
                        type="text"
                        name={`interview_questions_${index}`}
                        value={question}
                        onChange={(e) => {
                          const newQuestions = [
                            ...jobDetails.interview_questions,
                          ];
                          newQuestions[index] = e.target.value;
                          setJobDetails({
                            ...jobDetails,
                            interview_questions: newQuestions,
                          });
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md mb-2 text-sm"
                      />
                      <button
                        onClick={() => {
                          const newQuestions =
                            jobDetails.interview_questions.filter(
                              (_, i) => i !== index
                            );
                          setJobDetails({
                            ...jobDetails,
                            interview_questions: newQuestions,
                          });
                        }}
                        className="ml-2 p-2 bg-red-500 text-white rounded-md"
                      >
                        <ArchiveBoxIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setJobDetails({
                        ...jobDetails,
                        interview_questions: [
                          ...jobDetails.interview_questions,
                          "",
                        ],
                      })
                    }
                    className="p-2 bg-blue-500 text-white rounded-md"
                  >
                    Add Question
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={createJob}
            className="mt-4 p-2 bg-green-500 text-white rounded-md"
          >
            Create Job
          </button>
        </div>
      )}
    </div>
  );
};

export default AddJob;
