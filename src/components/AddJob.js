import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AddJob = ({ user }) => {
  const [jobPost, setJobPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleJobPostChange = (e) => {
    setJobPost(e.target.value);
  };

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
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50">
      <Card className="w-1/3 m-4 overflow-hidden">
        <CardHeader>
          <CardTitle>How to Add a Job</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
            <ol className="text-sm list-decimal list-inside space-y-4">
              <li>Copy the job listing text from your careers page.</li>
              <li>Paste it into the text area on this page.</li>
              <li>Click Generate Job Listing to proceed.</li>
              <li>Our AI will parse the details and generate interview questions.</li>
              <li>You can review and edit the information before finalizing the job post.</li>
              <li>Once submitted, you will get a link to share with candidates or post online.</li>
            </ol>
            <p className="text-sm mt-6">
              Candidates will go through an automated screening call, and you will receive a qualification score to help filter applications.
            </p>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="w-2/3 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Add New Job</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="input" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="input">Job Input</TabsTrigger>
                <TabsTrigger value="preview" disabled={!jobPost}>Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="input">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <ScrollArea className="h-[calc(100vh-24rem)] border rounded">
                    <Textarea
                      className="w-full h-full p-4 text-sm resize-none"
                      placeholder="Paste the job listing here..."
                      value={jobPost}
                      onChange={handleJobPostChange}
                    />
                  </ScrollArea>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !jobPost}
                  >
                    {isLoading ? "Processing..." : "Generate Job Listing"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="preview">
                <ScrollArea className="h-[calc(100vh-24rem)] p-4 border rounded">
                  <pre className="text-sm whitespace-pre-wrap">{jobPost}</pre>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="text-white text-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
            <h2 className="text-xl font-semibold">{loadingMessage}</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddJob;
