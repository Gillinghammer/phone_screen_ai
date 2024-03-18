import { PrismaClient } from "@prisma/client";
import Head from "next/head";
import React, { useState } from "react";
import Link from "next/link";
import Layout from "../../components/Layout";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session || !session.user?.email) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  let candidates = await prisma.candidate.findMany({
    where: { jobPost: { userId: user.id } },
    include: {
      jobPost: true,
      phoneScreen: true,
    },
  });

  candidates = candidates.map((candidate) => ({
    ...candidate,
    createdAt: candidate.createdAt.toISOString(),
    updatedAt: candidate.updatedAt.toISOString(),
    phoneScreen: candidate.phoneScreen
      ? {
          ...candidate.phoneScreen,
          createdAt: candidate.phoneScreen.createdAt.toISOString(),
          updatedAt: candidate.phoneScreen.updatedAt.toISOString(),
          endAt: candidate.phoneScreen.endAt
            ? candidate.phoneScreen.endAt.toISOString()
            : null,
        }
      : null,
  }));

  return {
    props: {
      candidates,
    },
  };
}

export default function CandidatesPage({ candidates }) {
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterText, setFilterText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  const filteredCandidates = candidates
    .filter((candidate) => {
      const searchText = filterText.toLowerCase();
      return (
        (candidate.name.toLowerCase().includes(searchText) ||
          candidate.email.toLowerCase().includes(searchText)) &&
        (selectedStatus === "" || candidate.status === selectedStatus)
      );
    })
    .sort((a, b) => {
      if (sortField) {
        const valueA = a.phoneScreen ? a.phoneScreen.qualificationScore : 0;
        const valueB = b.phoneScreen ? b.phoneScreen.qualificationScore : 0;
        if (sortField === "qualificationScore") {
          return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
        }
        // For other fields, use string comparison
        if (valueA < valueB) {
          return sortOrder === "asc" ? -1 : 1;
        }
        if (valueA > valueB) {
          return sortOrder === "asc" ? 1 : -1;
        }
      }
      return 0;
    });

  return (
    <>
      <Head>
        <title>Candidates</title>
      </Head>
      <Layout>
        <div className="container mx-auto mt-10">
          <h1 className="text-4xl font-bold mb-6">Candidates</h1>
          <div className="mb-4 flex items-center w-1/3">
            <input
              type="text"
              placeholder="Filter by name or email..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="p-2 border border-gray-300 rounded-md mr-4 flex-grow"
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="p-2 border border-gray-300 rounded-md w-40"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                <tr className="text-left">
                  <th
                    className="p-2 whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="font-semibold text-left flex items-center">
                      Name
                      {sortField === "name" && (
                        <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="p-2 whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    <div className="font-semibold text-left flex items-center">
                      Email
                      {sortField === "email" && (
                        <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="p-2 whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("qualificationScore")}
                  >
                    <div className="font-semibold text-left flex items-center">
                      Qualification Score
                      {sortField === "qualificationScore" && (
                        <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="p-2 whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="font-semibold text-left flex items-center">
                      Application Date
                      {sortField === "createdAt" && (
                        <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="p-2 whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("jobTitle")}
                  >
                    <div className="font-semibold text-left flex items-center">
                      Job Applied
                      {sortField === "jobTitle" && (
                        <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="p-2 whitespace-nowrap cursor-pointer"
                    onClick={() => handleSort("status")}
                  >
                    <div className="font-semibold text-left flex items-center">
                      Status
                      {sortField === "status" && (
                        <span>{sortOrder === "asc" ? " ▲" : " ▼"}</span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody className="text-sm divide-y divide-gray-100">
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="font-medium text-gray-800">
                          <Link
                            href={`/jobs/${candidate.jobPost.id}/${candidate.id}`}
                            className="text-blue-600"
                          >
                            {candidate.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left">{candidate.email}</div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left">
                        {candidate.phoneScreen
                          ? candidate.phoneScreen.qualificationScore.toFixed(2)
                          : "-"}
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left">
                        {new Date(candidate.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left">
                        <Link
                          href={`/jobs/${candidate.jobPost.id}`}
                          className="text-blue-600"
                        >
                          {candidate.jobPost.jobTitle}
                        </Link>
                      </div>
                    </td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="text-left">{candidate.status}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    </>
  );
}
