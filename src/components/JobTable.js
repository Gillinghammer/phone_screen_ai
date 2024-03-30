import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, parseISO } from "date-fns";

const JobTable = ({ jobs, refetchJobs }) => {
  const [selectedJobs, setSelectedJobs] = useState([]);

  const handleSelectJob = (jobId) => {
    const selectedIndex = selectedJobs.indexOf(jobId);
    let newSelectedJobs = [];

    if (selectedIndex === -1) {
      newSelectedJobs = newSelectedJobs.concat(selectedJobs, jobId);
    } else if (selectedIndex === 0) {
      newSelectedJobs = newSelectedJobs.concat(selectedJobs.slice(1));
    } else if (selectedIndex === selectedJobs.length - 1) {
      newSelectedJobs = newSelectedJobs.concat(selectedJobs.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelectedJobs = newSelectedJobs.concat(
        selectedJobs.slice(0, selectedIndex),
        selectedJobs.slice(selectedIndex + 1)
      );
    }

    setSelectedJobs(newSelectedJobs);
  };

  const handleArchiveJobs = async () => {
    try {
      await Promise.all(
        selectedJobs.map(async (jobId) => {
          await fetch("/api/archiveJob", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ jobId }),
          });
        })
      );
      console.log("Archive jobs:", selectedJobs);
      setSelectedJobs([]);
      refetchJobs();
    } catch (error) {
      console.error("Error archiving jobs:", error);
    }
  };

  return (
    <>
      <div className="mb-4 flex items-center">
        <button
          className={`px-4 py-2 font-semibold text-white rounded-md ${
            selectedJobs.length === 0
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          } ${selectedJobs.length === 0 ? "" : "hover:bg-red-600"}`}
          disabled={selectedJobs.length === 0}
          onClick={handleArchiveJobs}
        >
          Archive
        </button>
        <Link
          href="/add"
          className="ml-4 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold py-2 px-4 rounded"
        >
          Add Job
        </Link>
      </div>
      <table className="table-auto w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Days Since Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Job Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Job Screening URL
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Candidates
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avg Score
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {jobs.map((job) => {
            const totalScore = job.candidates.reduce((acc, candidate) => {
              return (
                acc + Number(candidate.phoneScreen?.qualificationScore || 0)
              );
            }, 0);

            const avgScore =
              job.candidates.length > 0
                ? totalScore / job.candidates.length
                : NaN;

            const displayAvgScore = isNaN(avgScore) ? "-" : avgScore.toFixed(2);

            const createdAtDate = parseISO(job.createdAt);
            const daysSinceCreated = formatDistanceToNow(createdAtDate, {
              addSuffix: true,
            });

            return (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={selectedJobs.includes(job.id)}
                    onChange={() => handleSelectJob(job.id)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {daysSinceCreated}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {job.company}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {job.jobTitle}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/apply/${job.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Apply here
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-900">
                    {job.candidates.length}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-sm text-gray-900">{displayAvgScore}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default JobTable;
