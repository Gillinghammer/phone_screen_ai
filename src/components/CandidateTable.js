import React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PhoneIcon, EnvelopeClosedIcon } from '@radix-ui/react-icons';
import { differenceInDays } from 'date-fns';

export default function CandidateTable({ candidates, jobId }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Qualification</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Screened</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {candidates.map((candidate) => (
          <TableRow key={candidate.id}>
            <TableCell className="font-medium">
              <Link href={`/jobs/${jobId}/${candidate.id}`} className="text-black hover:underline">
                {candidate.name}
              </Link>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(candidate.status)}>
                {candidate.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getQualificationVariant(candidate.phoneScreen)}>
                {getQualificationLabel(candidate.phoneScreen)}
              </Badge>
            </TableCell>
            <TableCell>
              {getDurationLabel(candidate.phoneScreen)}
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <PhoneIcon className="mr-2" />
                  {candidate.phone}
                </div>
                <div className="flex items-center mt-1">
                  <EnvelopeClosedIcon className="mr-2" />
                  {candidate.email}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {getScreenedDays(candidate.phoneScreen)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function getQualificationLabel(phoneScreen) {
  if (!phoneScreen || Object.keys(phoneScreen).length === 0) {
    return 'Voicemail';
  }
  if (phoneScreen.qualificationScore === 0) {
    return 'Dropped Call';
  }
  return `${phoneScreen.qualificationScore.toFixed(0)}%`;
}

function getQualificationVariant(phoneScreen) {
  if (!phoneScreen || Object.keys(phoneScreen).length === 0) {
    return 'secondary';
  }
  if (phoneScreen.qualificationScore === 0) {
    return 'destructive';
  }
  const score = phoneScreen.qualificationScore;
  if (score < 0.4) return 'destructive';
  if (score < 0.7) return 'warning';
  return 'success';
}

function getDurationLabel(phoneScreen) {
  if (!phoneScreen || phoneScreen.qualificationScore === 0 || !phoneScreen.callLength) {
    return 'N/A';
  }
  const minutes = Math.floor(phoneScreen.callLength);
  const seconds = Math.round((phoneScreen.callLength - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function getStatusVariant(status) {
  switch (status) {
    case 'OPEN':
      return 'default';
    case 'ACCEPTED':
      return 'success';
    case 'REJECTED':
      return 'destructive';
    case 'ARCHIVED':
      return 'secondary';
    default:
      return 'default';
  }
}

function getScreenedDays(phoneScreen) {
  if (!phoneScreen || !phoneScreen.createdAt) {
    return 'Not screened';
  }
  const days = differenceInDays(new Date(), new Date(phoneScreen.createdAt));
  return days === 0 ? 'Today' : `${days} day${days !== 1 ? 's' : ''} ago`;
}
