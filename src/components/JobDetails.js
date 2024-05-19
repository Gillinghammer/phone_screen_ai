import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { usePostHog } from "posthog-js/react";

const JobDetailsForm = ({ jobData, drawer, refreshData }) => {
  const posthog = usePostHog();
  const [jobDetails, setJobDetails] = useState(jobData);
  const [formErrors, setFormErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setJobDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleCheckboxChange = (checked) => {
    setJobDetails((prevDetails) => ({
      ...prevDetails,
      remote_friendly: checked,
    }));
  };

  const handleInterviewQuestionChange = (e, index) => {
    const { value } = e.target;
    setJobDetails((prevDetails) => {
      const updatedQuestions = [...prevDetails.interview_questions];
      updatedQuestions[index] = value;
      return {
        ...prevDetails,
        interview_questions: updatedQuestions,
      };
    });
  };

  const handleAddQuestion = () => {
    if (jobDetails.interview_questions.length < 10) {
      posthog.capture("Question Added");
      setJobDetails((prevDetails) => ({
        ...prevDetails,
        interview_questions: [...prevDetails.interview_questions, ""],
      }));
    }
  };

  const handleRemoveQuestion = (index) => {
    posthog.capture("Question Removed");
    setJobDetails((prevDetails) => {
      const updatedQuestions = [...prevDetails.interview_questions];
      updatedQuestions.splice(index, 1);
      return {
        ...prevDetails,
        interview_questions: updatedQuestions,
      };
    });
  };

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    if (!jobDetails.company.trim()) {
      errors.company = "Company name is required";
      isValid = false;
    }

    if (!jobDetails.job_title.trim()) {
      errors.job_title = "Job title is required";
      isValid = false;
    }

    if (!jobDetails.job_location.trim()) {
      errors.job_location = "Job location is required";
      isValid = false;
    }

    const validQuestions = jobDetails.interview_questions.filter(
      (question) => question.trim() !== ""
    );
    if (validQuestions.length !== jobDetails.interview_questions.length) {
      setJobDetails((prevDetails) => ({
        ...prevDetails,
        interview_questions: validQuestions,
      }));
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const updatedJobDetails = {
        ...jobDetails,
        interview_questions: jobDetails.interview_questions.filter(
          (question) => question.trim() !== ""
        ),
      };

      try {
        const response = await fetch("/api/update-job", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedJobDetails),
        });

        if (response.ok) {
          // Job updated successfully
          console.log("Job updated successfully");
          posthog.capture("Job Updated");
          // Perform any necessary actions after successful update
          refreshData();
          drawer(false); // Close the drawer
        } else {
          // Handle error
          console.error("Failed to update job");
        }
      } catch (error) {
        console.error("Error updating job:", error);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="job_title">Job Title</Label>
            <Input
              id="job_title"
              name="job_title"
              value={jobDetails.job_title}
              onChange={handleInputChange}
              className={formErrors.job_title ? "error" : ""}
            />
            {formErrors.job_title && (
              <p className="text-red-500 text-sm">{formErrors.job_title}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="job_location">Job Location</Label>
            <Input
              id="job_location"
              name="job_location"
              value={jobDetails.job_location}
              onChange={handleInputChange}
              className={formErrors.job_location ? "error" : ""}
            />
            {formErrors.job_location && (
              <p className="text-red-500 text-sm">{formErrors.job_location}</p>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="job_description">Job Description</Label>
          <Textarea
            id="job_description"
            name="job_description"
            rows={8}
            value={jobDetails.job_description}
            onChange={handleInputChange}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="remote_friendly">
            {jobDetails.remote_friendly
              ? "This job is remote friendly"
              : "This job is not remote friendly"}
          </Label>
          <Switch
            id="remote_friendly"
            name="remote_friendly"
            checked={jobDetails.remote_friendly}
            onCheckedChange={handleCheckboxChange}
          />
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">Screening Questions</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Review these AI generated questions based on your supplied job post.
            Our AI agent will ask each of these questions to every candidate and
            score their response.
          </p>
          {jobDetails.interview_questions.map((question, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <div className="grid gap-2 flex-1">
                <Input
                  id={`interview_question_${index}`}
                  name={`interview_question_${index}`}
                  value={question}
                  onChange={(e) => handleInterviewQuestionChange(e, index)}
                />
              </div>
              <Button
                variant="destructive"
                type="button"
                size="sm"
                onClick={() => handleRemoveQuestion(index)}
              >
                Remove
              </Button>
            </div>
          ))}
          {jobDetails.interview_questions.length < 10 && (
            <Button type="button" variant="outline" onClick={handleAddQuestion}>
              Add Question
            </Button>
          )}
        </div>
        <div className="flex justify-start space-x-2 py-4">
          <Button type="submit">Update Job</Button>
          <Button type="button" variant="outline" onClick={() => drawer(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};

export default JobDetailsForm;
