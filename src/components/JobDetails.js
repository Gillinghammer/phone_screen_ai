import React from 'react';

const JobDetails = ({ jobData }) => {
  if (!jobData) {
    return <div>Loading job details...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{jobData.job_title}</h2>
      <div>
        <h3 className="text-lg font-semibold">Location</h3>
        <p>{jobData.job_location}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Description</h3>
        <p className="whitespace-pre-wrap">{jobData.job_description}</p>
      </div>
      <div>
        <h3 className="text-lg font-semibold">Remote Friendly</h3>
        <p>{jobData.remote_friendly ? 'Yes' : 'No'}</p>
      </div>
      {jobData.interview_questions && jobData.interview_questions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold">Screening Questions</h3>
          <ul className="list-disc pl-5">
            {jobData.interview_questions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
