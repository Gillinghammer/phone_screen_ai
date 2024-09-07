import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

const JobPostParser = ({ companyId, onClose }) => {
  const [jobPost, setJobPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleJobPostChange = (e) => {
    setJobPost(e.target.value);
  };

  const handleParseJob = async () => {
    setIsLoading(true);
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

      // Map the parsed job data to the expected format
      const jobData = {
        companyId,
        jobTitle: parsedJob.job_title,
        jobLocation: parsedJob.job_location,
        jobDescription: parsedJob.job_description,
        remoteFriendly: parsedJob.remote_friendly,
        seniority: parsedJob.seniority,
        salary: parsedJob.salary,
        requirements: { set: parsedJob.requirements },
        responsibilities: { set: parsedJob.responsibilities },
        interviewQuestions: { set: parsedJob.interview_questions },
      };

      // Call the create-job endpoint
      const createResponse = await fetch("/api/create-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(errorData.message || "Failed to create job");
      }

      toast({
        title: "Job Created",
        description: "The job has been successfully created.",
      });

      onClose();
    } catch (error) {
      console.error('Error parsing/creating job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow">
        <Textarea
          placeholder="Paste your job posting here..."
          value={jobPost}
          onChange={handleJobPostChange}
          className="w-full h-full min-h-[calc(100vh-250px)] text-sm resize-none"
        />
      </div>
      <div className="mt-4">
        <Button 
          onClick={handleParseJob} 
          className="w-full"
          disabled={isLoading || !jobPost.trim()}
        >
          {isLoading ? "Processing..." : "Parse Job"}
        </Button>
      </div>
    </div>
  );
};

export default JobPostParser;