import React from 'react';
import { Button } from "@/components/ui/button";

export default function JobPageHeader({ 
  job, 
  onEditJobClick
}) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold tracking-tight">{job.jobTitle}</h1>
      <Button 
        variant="outline" 
        onClick={onEditJobClick}
        className="bg-gray-100 text-gray-900 hover:bg-gray-200"
      >
        Edit Job
      </Button>
    </div>
  );
}
