import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { DragHandleDots2Icon } from '@radix-ui/react-icons';

export default function JobEditDialog({ isOpen, onClose, job, refreshData }) {
  const { register, control, handleSubmit, reset, formState: { errors }, getValues } = useForm();
  const { fields: interviewQuestionFields, append: appendInterviewQuestion, remove: removeInterviewQuestion, move: moveInterviewQuestion } = useFieldArray({
    control,
    name: "interviewQuestions"
  });
  const { toast } = useToast();

  const [draggedIndex, setDraggedIndex] = useState(null);

  useEffect(() => {
    if (job) {
      reset({
        jobTitle: job.jobTitle || '',
        jobLocation: job.jobLocation || '',
        jobDescription: job.jobDescription || '',
        salary: job.salary || '',
        seniority: job.seniority || '',
        remoteFriendly: job.remoteFriendly || false,
        requirements: job.requirements?.set?.join("\n") || '',
        responsibilities: job.responsibilities?.set?.join("\n") || '',
        interviewQuestions: job.interviewQuestions?.set || []
      });
    }
  }, [job, reset]);

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`/api/update-job`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: job.id,
          ...data,
          remoteFriendly: data.remoteFriendly,
          requirements: { set: data.requirements.split("\n").filter(item => item.trim() !== '') },
          responsibilities: { set: data.responsibilities.split("\n").filter(item => item.trim() !== '') },
          interviewQuestions: { set: data.interviewQuestions.filter(q => q.trim() !== '') },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update job');
      }

      const updatedJob = await response.json();

      toast({
        title: "Job Updated",
        description: "The job details have been successfully updated.",
      });

      refreshData();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update job. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      moveInterviewQuestion(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogContent className="w-[800px] max-w-[100vw]">
        <DialogHeader>
          <DialogTitle>Edit Job: {job?.jobTitle}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[calc(100vh-10rem)] px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="details">Job Details</TabsTrigger>
                <TabsTrigger value="questions">Interview Questions</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    {...register("jobTitle", { required: "Job title is required" })}
                  />
                  {errors.jobTitle && <p className="text-red-500 text-sm mt-1">{errors.jobTitle.message}</p>}
                </div>
                <div>
                  <Label htmlFor="jobLocation">Job Location</Label>
                  <Input
                    id="jobLocation"
                    {...register("jobLocation", { required: "Job location is required" })}
                  />
                  {errors.jobLocation && <p className="text-red-500 text-sm mt-1">{errors.jobLocation.message}</p>}
                </div>
                <div>
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    {...register("salary")}
                  />
                </div>
                <div>
                  <Label htmlFor="seniority">Seniority</Label>
                  <Input
                    id="seniority"
                    {...register("seniority")}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    name="remoteFriendly"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="remoteFriendly"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="remoteFriendly">Remote Friendly</Label>
                </div>
              </TabsContent>
              <TabsContent value="details" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    {...register("jobDescription", { required: "Job description is required" })}
                    className="min-h-[200px]"
                  />
                  {errors.jobDescription && <p className="text-red-500 text-sm mt-1">{errors.jobDescription.message}</p>}
                </div>
                <div>
                  <Label htmlFor="requirements">Requirements (one per line)</Label>
                  <Textarea
                    id="requirements"
                    {...register("requirements")}
                    className="min-h-[150px]"
                  />
                </div>
                <div>
                  <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
                  <Textarea
                    id="responsibilities"
                    {...register("responsibilities")}
                    className="min-h-[150px]"
                  />
                </div>
              </TabsContent>
              <TabsContent value="questions" className="space-y-4 mt-4">
                <div>
                  <Label>Interview Questions</Label>
                  {interviewQuestionFields.map((field, index) => (
                    <div
                      key={field.id}
                      className={`flex items-center space-x-2 mt-2 group ${draggedIndex === index ? 'bg-blue-100 border border-blue-300' : ''}`}
                      draggable
                      onDragStart={(e) => {
                        handleDragStart(index);
                        const img = new Image();
                        img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E";
                        e.dataTransfer.setDragImage(img, 0, 0);
                      }}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd}
                      style={{ transition: 'background-color 0.2s ease, border 0.2s ease' }}
                    >
                      <DragHandleDots2Icon className="cursor-move text-gray-500" />
                      <Input
                        {...register(`interviewQuestions.${index}`, { required: "Question is required" })}
                      />
                      <Button 
                        type="button" 
                        onClick={() => removeInterviewQuestion(index)} 
                        variant="destructive" 
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => appendInterviewQuestion("")}
                    className="mt-2"
                    variant="outline"
                  >
                    Add Question
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </form>
        </ScrollArea>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit(onSubmit)}>Save Changes</Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
