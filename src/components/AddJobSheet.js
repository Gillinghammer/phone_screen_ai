import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import JobPostParser from "./JobPostParser";

const AddJobSheet = ({ isOpen, onClose, companyId, onJobAdded }) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[80vw] max-w-[1200px] sm:max-w-none">
        <SheetHeader>
          <SheetTitle>Add Job</SheetTitle>
          <SheetDescription>
            Paste your job posting below and click "Parse Job" to automatically fill in the details.
          </SheetDescription>
        </SheetHeader>
        <div className="h-[calc(100vh-120px)] mt-4">
          <JobPostParser
            companyId={companyId}
            onClose={() => {
              onJobAdded();
              onClose();
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddJobSheet;