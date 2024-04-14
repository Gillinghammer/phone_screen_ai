import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";

interface JobPostParserProps {
  companyId: string;
  onClose: () => void;
}

const JobPostParser = ({ companyId, onClose }: JobPostParserProps) => {
  const [jobPostText, setJobPostText] = useState("");
  const [loading, setLoading] = useState(false);
  const handleParseJobPost = async () => {
    setLoading(true);
    try {
      // Make API call to parse job post and generate questions
      const parseResponse = await fetch("/api/parse-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ details: jobPostText }),
      });
      const parsedData = await parseResponse.json();
      console.log(parsedData);

      // Format the parsed data
      const formattedParsedData = {
        companyId: companyId,
        jobTitle: parsedData.job_title,
        jobLocation: parsedData.job_location,
        jobDescription: parsedData.job_description,
        remoteFriendly: parsedData.remote_friendly,
        seniority: parsedData.seniority,
        salary: parsedData.salary,
        requirements: parsedData.requirements,
        responsibilities: parsedData.responsibilities,
        interviewQuestions: parsedData.interview_questions,
      };

      // Make API call to create the job with the parsed data
      const createResponse = await fetch("/api/create-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedParsedData),
      });

      if (createResponse.ok) {
        onClose();
      } else {
        throw new Error("Failed to create job");
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        console.error("An unknown error occurred:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Label htmlFor="job-post-text">Job Post</Label>
      <Textarea
        id="job-post-text"
        placeholder="Paste job post here"
        value={jobPostText}
        onChange={(e) => setJobPostText(e.target.value)}
        rows={20}
        disabled={loading}
      />
      <Button onClick={handleParseJobPost} disabled={loading}>
        {loading ? (
          <>
            {jobPostText ? "Creating Job" : "Parsing Job Post"}{" "}
            <Spinner size="lg" />
          </>
        ) : (
          "Parse Job Post"
        )}
      </Button>
    </>
  );
};

export default JobPostParser;
