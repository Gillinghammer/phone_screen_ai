// pages/dashboard.js
import Layout from "../components/Layout";
import { formatDistanceToNow } from "date-fns";
import { getSession } from "next-auth/react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { prisma } from '../lib/prisma';

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
    select: {
      id: true,
      email: true,
      companyId: true,
      name: true,
    },
  });

  const candidates = await prisma.candidate.findMany({
    where: {
      jobPost: {
        companyId: user.companyId,
      },
    },
    include: {
      jobPost: true,
      phoneScreen: true,
    },
  });

  const activeRoles = await prisma.job.count({
    where: {
      companyId: user.companyId,
      isArchived: false,
    },
  });

  const avgScore =
    candidates.reduce(
      (sum, candidate) =>
        sum + (candidate.phoneScreen?.qualificationScore || 0),
      0
    ) / candidates.length || 0;

  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const last7DaysCandidates = await prisma.candidate.findMany({
    where: {
      jobPost: {
        companyId: user.companyId,
      },
      createdAt: {
        gte: last7Days,
      },
    },
    include: {
      phoneScreen: true,
    },
  });

  const filteredCandidates = last7DaysCandidates.filter(
    (candidate) =>
      candidate.phoneScreen && candidate.phoneScreen.qualificationScore !== null
  );

  const candidateCountByDay = filteredCandidates.reduce((acc, candidate) => {
    const day = new Date(candidate.createdAt).toLocaleDateString("en-US", {
      weekday: "short",
    });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  const last7DaysData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    return {
      name: day,
      total: candidateCountByDay[day] || 0,
    };
  }).reverse();

  return {
    props: {
      candidates: JSON.parse(JSON.stringify(candidates)),
      avgScore,
      activeRoles,
      last7DaysData,
    },
  };
}

const DashboardPage = ({
  candidates,
  avgScore,
  activeRoles,
  last7DaysData,
}) => {
  return (
    <Layout>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{candidates.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgScore.toFixed(0)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRoles}</div>
            </CardContent>
          </Card>
        </div>
        <div className="bg-white p-6 rounded shadow mb-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={last7DaysData}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Bar
                dataKey="total"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Candidates</h3>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="text-left py-2">Timestamp</th>
                <th className="text-left py-2">Candidate</th>
                <th className="text-left py-2">Role</th>
                <th className="text-left py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {candidates
                .filter(
                  (candidate) => !!candidate.phoneScreen?.qualificationScore
                )
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 40)
                .map((candidate) => (
                  <tr key={candidate.id}>
                    <td className="py-2">
                      {formatDistanceToNow(new Date(candidate.createdAt))} ago
                    </td>
                    <td className="py-2">
                      <Link
                        href={`/jobs/${candidate.jobPost.id}/${candidate.id}`}
                      >
                        {candidate.name}
                      </Link>
                    </td>
                    <td className="py-2">
                      <Link href={`/jobs/${candidate.jobPost.id}`}>
                        {candidate.jobPost.jobTitle}
                      </Link>
                    </td>
                    <td className="py-2">
                      {candidate.phoneScreen?.qualificationScore
                        ? candidate.phoneScreen.qualificationScore.toFixed(2)
                        : ""}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
