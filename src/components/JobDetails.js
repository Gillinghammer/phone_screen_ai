import { ArchiveBoxIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";

const InputRow = ({ children }) => (
  <div className="flex mb-4 space-x-4">{children}</div>
);

const InputField = ({
  label,
  name,
  value,
  handleChange,
  type = "text",
  width = "full",
}) => (
  <div className={`w-${width}`}>
    <label htmlFor={name} className="block text-sm text-gray-700 my-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      placeholder={label}
      value={value}
      onChange={handleChange}
      className="w-full p-2 border border-gray-300 rounded-md text-xs"
    />
  </div>
);

const TextAreaField = ({ label, name, value, handleChange, rows = 3 }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-sm text-gray-700 my-2">
      {label}
    </label>
    <textarea
      name={name}
      placeholder={label}
      value={value}
      onChange={handleChange}
      rows={rows}
      className="w-full p-2 border border-gray-300 rounded-md text-xs"
    />
  </div>
);

const CheckboxField = ({ label, name, checked, handleChange }) => (
  <div className="mb-4 flex items-center">
    <label htmlFor={name} className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={handleChange}
          className="sr-only" // Hide the default checkbox
        />
        <div
          className={`block bg-gray-200 w-14 h-8 rounded-full ${
            checked ? "bg-green-400" : "bg-gray-200"
          }`}
        ></div>
        <div
          className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
            checked ? "translate-x-full" : ""
          }`}
        ></div>
      </div>
      <span className="ml-3 text-sm text-gray-700">
        {checked ? "Remote Job" : "Not Remote"}
      </span>
    </label>
  </div>
);

const ListEditor = ({
  label,
  items,
  handleAdd,
  handleRemove,
  handleChange,
}) => (
  <div className="mb-4">
    <h3 className="text-sm font-semibold text-gray-900 mb-2">{label}</h3>
    <p className="pb-4 text-sm">
      Review these AI generated interview questions based on your supplied job
      post. Our AI agent will ask each of these questions to every candidate and
      score their response.{" "}
    </p>
    {items.map((item, index) => (
      <div key={index} className="flex items-center mb-2">
        <input
          type="text"
          name={`${label.toLowerCase().replace(/\s/g, "_")}_${index}`}
          value={item}
          onChange={(e) => handleChange(e, index)}
          className="w-full p-2 border border-gray-300 rounded-md text-xs"
        />
        <button
          onClick={() => handleRemove(index)}
          type="button"
          className="ml-2 p-2 bg-red-500 text-white rounded-md"
        >
          <ArchiveBoxIcon className="h-4 w-4" />
        </button>
      </div>
    ))}
    {items.length < 10 && (
      <button
        onClick={handleAdd}
        type="button"
        // outline secondary button, on hover, bg-gray-100
        className="p-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-300"
      >
        Add Question
      </button>
    )}
  </div>
);

// Assuming `setJobDetails` and `jobDetails` states are defined in the parent component
const JobDetailsForm = ({ jobDetails, setJobDetails }) => {
  const router = useRouter();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobDetails({ ...jobDetails, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    setJobDetails({ ...jobDetails, [e.target.name]: e.target.checked });
  };

  const handleAddQuestion = () => {
    setJobDetails({
      ...jobDetails,
      interview_questions: [...jobDetails.interview_questions, ""],
    });
  };

  const handleRemove = (index, field) => {
    const newList = jobDetails[field].filter((_, i) => i !== index);
    setJobDetails({ ...jobDetails, [field]: newList });
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
        router.push("/jobs");
      } else {
        throw new Error("Failed to create job");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex">
      <div className="w-full space-y-6">
        <div>
          <InputRow>
            <InputField
              label="Company Name"
              name="company"
              value={jobDetails.company}
              handleChange={handleInputChange}
              width="1/2"
            />
            <InputField
              label="Job Title"
              name="job_title"
              value={jobDetails.job_title}
              handleChange={handleInputChange}
              width="1/2"
            />
          </InputRow>
          <InputField
            label="Job Location"
            name="job_location"
            value={jobDetails.job_location}
            handleChange={handleInputChange}
          />
          <TextAreaField
            label="Job Description"
            name="job_description"
            rows={10}
            value={jobDetails.job_description}
            handleChange={handleInputChange}
          />
          <CheckboxField
            label="Remote Friendly"
            name="remote_friendly"
            checked={jobDetails.remote_friendly}
            handleChange={handleCheckboxChange}
          />
          <ListEditor
            label="Interview Questions"
            items={jobDetails.interview_questions}
            handleAdd={handleAddQuestion}
            handleRemove={(index) => handleRemove(index, "interview_questions")}
            handleChange={handleInputChange}
          />
        </div>
        <div className="text-right">
          <button
            onClick={createJob}
            className="mt-4 p-2 bg-green-500 text-white font-bold py-2 px-4 rounded"
          >
            Create Job Listing
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsForm;
