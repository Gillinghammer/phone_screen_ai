import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TrashIcon, PlusCircledIcon } from "@radix-ui/react-icons";

const sampleParsedData = {
  company: "Ashland Manufacturing Co.",
  job_title: "Administrative Assistant",
  job_location: "Ashland, VA",
  job_description:
    "Administrative Assistant\nAshland, VA\nFull time\n$19-20 (Hourly)",
  remote_friendly: false,
  seniority: "Seniority level cannot be determined from the job posting.",
  salary: null,
  requirements: [
    "High School Diploma or equivalent.",
    "Minimum of 2 years of experience in an administrative role or similar capacity.",
    "Excellent time management skills with the ability to prioritize tasks effectively.",
    "Strong attention to detail and accuracy in all work performed.",
    "Proficiency in Microsoft Office applications.",
  ],
  responsibilities: [
    "Answer phones and greet visitors in a friendly and professional manner.",
    "Schedule appointments and maintain calendars for executives and staff.",
    "Schedule and coordinate meetings, including arranging venues and catering if necessary.",
    "Collate and distribute mail, ensuring timely delivery to appropriate recipients.",
    "Prepare various communications such as memos, emails, invoices, reports, and other correspondence.",
    "Write and edit communications, ranging from letters to reports and instructional documents, ensuring accuracy and clarity.",
    "Create and maintain filing systems, both electronic and physical, to ensure efficient organization and retrieval of documents.",
    "Utilize Microsoft Office Suite for various tasks, including word processing, spreadsheet management, and presentation creation.",
  ],
  interview_questions: [
    "Are you a detail-oriented individual with a passion for administrative support?",
    "Do you have experience answering phones and greeting visitors in a professional manner?",
    "Can you schedule appointments and maintain calendars effectively?",
    "Are you comfortable scheduling and coordinating meetings, including venue and catering arrangements?",
    "Have you had experience collating and distributing mail in a timely manner?",
    "Can you prepare various communications such as memos, emails, invoices, and reports accurately?",
    "Have you written and edited communications with attention to accuracy and clarity?",
    "Are you experienced in creating and maintaining filing systems, both electronic and physical?",
    "Do you have proficiency in Microsoft Office Suite for various tasks?",
    "Are you available to work full-time from Monday to Friday, 8:30 AM to 5:00 PM in Ashland, VA?",
  ],
};

const JobPostParser = ({ companyId, onClose }) => {
  const [jobPostText, setJobPostText] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleParseJobPost = async () => {
    setLoading(true);
    // Make API call to parse job post and generate questions
    const response = await fetch("/api/parse-job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ details: jobPostText }),
    });
    const data = await response.json();
    console.log(data);
    setParsedData(data);
    setLoading(false);
  };

  const handleCreatePhoneScreen = async () => {
    try {
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

      const response = await fetch("/api/create-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedParsedData),
      });

      if (response.ok) {
        onClose();
      } else {
        throw new Error("Failed to create job");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddQuestion = () => {
    if (parsedData.interview_questions.length < 10) {
      setParsedData({
        ...parsedData,
        interview_questions: [...parsedData.interview_questions, ""],
      });
    }
  };

  const handleRemoveQuestion = (index) => {
    if (parsedData.interview_questions.length > 3) {
      const newQuestions = [...parsedData.interview_questions];
      newQuestions.splice(index, 1);
      setParsedData({
        ...parsedData,
        interview_questions: newQuestions,
      });
    }
  };

  return (
    <div className="space-y-6">
      {!parsedData && (
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
                Parsing Job Post <Spinner size="lg" />
              </>
            ) : (
              "Parse Job Post"
            )}
          </Button>
        </>
      )}
      {parsedData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={parsedData.company}
                onChange={(e) =>
                  setParsedData({ ...parsedData, company: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                value={parsedData.job_title}
                onChange={(e) =>
                  setParsedData({ ...parsedData, job_title: e.target.value })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="job-location">Job Location</Label>
              <Input
                id="job-location"
                value={parsedData.job_location}
                onChange={(e) =>
                  setParsedData({ ...parsedData, job_location: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="salary">Salary</Label>
              <Input
                id="salary"
                value={parsedData.salary || ""}
                onChange={(e) =>
                  setParsedData({ ...parsedData, salary: e.target.value })
                }
              />
            </div>
          </div>
          <Label htmlFor="job-description">Job Description</Label>
          <Textarea
            id="job-description"
            rows={4}
            value={parsedData.job_description}
            onChange={(e) =>
              setParsedData({ ...parsedData, job_description: e.target.value })
            }
          />
          <div className="flex items-center space-x-2 py-4">
            <Switch
              id="remote-friendly"
              checked={parsedData.remote_friendly}
              onCheckedChange={(checked) =>
                setParsedData({ ...parsedData, remote_friendly: checked })
              }
            />
            <Label htmlFor="remote-friendly">Remote Friendly</Label>
          </div>
          <Label htmlFor="seniority">Seniority</Label>
          <Textarea
            id="seniority"
            value={parsedData.seniority}
            onChange={(e) =>
              setParsedData({ ...parsedData, seniority: e.target.value })
            }
          />
          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea
              id="requirements"
              rows={parsedData.requirements.length}
              value={parsedData.requirements
                .map((req) => `- ${req}`)
                .join("\n")}
              onChange={(e) => {
                const newRequirements = e.target.value
                  .split("\n")
                  .map((req) => req.replace(/^-\s*/, ""));
                setParsedData({
                  ...parsedData,
                  requirements: newRequirements,
                });
              }}
            />
          </div>
          <div>
            <Label htmlFor="responsibilities">Responsibilities</Label>
            <Textarea
              id="responsibilities"
              rows={parsedData.responsibilities.length + 1}
              value={parsedData.responsibilities
                .map((resp) => `- ${resp}`)
                .join("\n")}
              onChange={(e) => {
                const newResponsibilities = e.target.value
                  .split("\n")
                  .map((resp) => resp.replace(/^-\s*/, ""));
                setParsedData({
                  ...parsedData,
                  responsibilities: newResponsibilities,
                });
              }}
            />
          </div>
          <div className="mx-2">
            <h3 className="text-lg font-semibold mb-2">
              Generated Interview Questions
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              These questions will be asked to every candidate.
            </p>
            {parsedData.interview_questions.map((question, index) => (
              <div key={index} className="py-2 flex items-center space-x-2">
                <Label htmlFor={`interview-question-${index}`}>
                  Interview Question {index + 1}
                </Label>
                <Input
                  id={`interview-question-${index}`}
                  value={question}
                  rows={1}
                  onChange={(e) => {
                    const newQuestions = [...parsedData.interview_questions];
                    newQuestions[index] = e.target.value;
                    setParsedData({
                      ...parsedData,
                      interview_questions: newQuestions,
                    });
                  }}
                />
                {parsedData.interview_questions.length > 3 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveQuestion(index)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {parsedData.interview_questions.length < 10 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}
                className="mt-2"
              >
                <PlusCircledIcon className="h-4 w-4" />
                &nbsp;Add Question
              </Button>
            )}
          </div>
          <Button onClick={handleCreatePhoneScreen} disabled={submitting}>
            {submitting ? <Spinner size="sm" /> : "Create PhoneScreen"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobPostParser;
