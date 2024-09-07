import React from 'react';

export default function JobPageHeader({ job }) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight">{job.jobTitle}</h1>
      <p className="text-gray-500">{job.jobLocation || 'Location not specified'}</p>
    </div>
  );
}
