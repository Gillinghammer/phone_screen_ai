import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MobileIcon, EnvelopeClosedIcon } from '@radix-ui/react-icons';
import { differenceInDays, parseISO } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CandidateTable({ 
  candidates, 
  jobId, 
  onBulkAction
}) {
  const [sortColumn, setSortColumn] = useState('screened');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedCandidates, setSelectedCandidates] = useState({});

  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      switch (sortColumn) {
        case 'name':
          return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        case 'status':
          return sortDirection === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
        case 'qualification':
          return sortDirection === 'asc' 
            ? (a.phoneScreen?.qualificationScore || 0) - (b.phoneScreen?.qualificationScore || 0)
            : (b.phoneScreen?.qualificationScore || 0) - (a.phoneScreen?.qualificationScore || 0);
        case 'duration':
          return sortDirection === 'asc'
            ? (a.phoneScreen?.callLength || 0) - (b.phoneScreen?.callLength || 0)
            : (b.phoneScreen?.callLength || 0) - (a.phoneScreen?.callLength || 0);
        case 'screened':
          return sortDirection === 'asc'
            ? new Date(a.phoneScreen?.createdAt || 0) - new Date(b.phoneScreen?.createdAt || 0)
            : new Date(b.phoneScreen?.createdAt || 0) - new Date(a.phoneScreen?.createdAt || 0);
        default:
          return 0;
      }
    });
  }, [candidates, sortColumn, sortDirection]);

  const handleSort = (column) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked) => {
    const newSelectedCandidates = {};
    sortedCandidates.forEach(candidate => {
      newSelectedCandidates[candidate.id] = checked;
    });
    setSelectedCandidates(newSelectedCandidates);
  };

  const handleSelectCandidate = (candidateId, checked) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [candidateId]: checked
    }));
  };

  const allSelected = sortedCandidates.every(candidate => selectedCandidates[candidate.id]);

  const SortableTableHead = ({ children, column }) => (
    <TableHead 
      className="text-center cursor-pointer"
      onClick={() => handleSort(column)}
    >
      {children}
      {sortColumn === column && (
        <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
      )}
    </TableHead>
  );

  const selectedCount = Object.values(selectedCandidates).filter(Boolean).length;

  const handleBulkAction = (action) => {
    const selectedIds = Object.entries(selectedCandidates)
      .filter(([_, isSelected]) => isSelected)
      .map(([id, _]) => id);
    if (onBulkAction && typeof onBulkAction === 'function') {
      onBulkAction(action, selectedIds);
    } else {
      console.error('onBulkAction is not a function or not provided');
    }
  };

  return (
    <>
      {selectedCount > 0 && (
        <div className="mb-4 flex items-center">
          <span className="mr-2">Actions ({selectedCount} selected):</span>
          <Select onValueChange={handleBulkAction}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACCEPT">Accept</SelectItem>
              <SelectItem value="REJECT">Reject</SelectItem>
              <SelectItem value="ARCHIVE">Archive</SelectItem>
              <SelectItem value="RESET">Reset</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] text-center">
              <Checkbox
                checked={allSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <SortableTableHead column="name">Name</SortableTableHead>
            <SortableTableHead column="status">Status</SortableTableHead>
            <SortableTableHead column="qualification">Qualification</SortableTableHead>
            <SortableTableHead column="duration">Duration</SortableTableHead>
            <TableHead className="text-center">Contact</TableHead>
            <SortableTableHead column="screened">Screened</SortableTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCandidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell className="text-center">
                <Checkbox
                  checked={selectedCandidates[candidate.id] || false}
                  onCheckedChange={(checked) => handleSelectCandidate(candidate.id, checked)}
                  aria-label={`Select ${candidate.name}`}
                />
              </TableCell>
              <TableCell className="font-medium text-center">
                <Link href={`/jobs/${jobId}/${candidate.id}`} className="text-black hover:underline">
                  {candidate.name}
                </Link>
              </TableCell>
              <TableCell className="text-center">
                <Badge 
                  variant={getStatusVariant(candidate.status)}
                  className={getStatusClassName(candidate.status)}
                >
                  {candidate.status}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {getQualificationLabel(candidate.phoneScreen)}
              </TableCell>
              <TableCell className="text-center">
                {getDurationLabel(candidate.phoneScreen)}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <MobileIcon className="mr-2" />
                    {candidate.phone}
                  </div>
                  <div className="flex items-center mt-1">
                    <EnvelopeClosedIcon className="mr-2" />
                    {candidate.email}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center">
                {getScreenedDays(candidate.phoneScreen)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

function getQualificationLabel(phoneScreen) {
  if (!phoneScreen || Object.keys(phoneScreen).length === 0) {
    return <Badge variant="warning" className="bg-yellow-100 text-yellow-800">VOICEMAIL</Badge>;
  }
  if (phoneScreen.qualificationScore === 0) {
    return <Badge variant="destructive" className="bg-red-100 text-red-800">DROPPED</Badge>;
  }
  return `${phoneScreen.qualificationScore.toFixed(0)}%`;
}

function getDurationLabel(phoneScreen) {
  if (!phoneScreen || phoneScreen.qualificationScore === 0 || !phoneScreen.callLength) {
    return '';
  }
  const minutes = Math.floor(phoneScreen.callLength);
  const seconds = Math.round((phoneScreen.callLength - minutes) * 60);
  return <Badge variant="secondary">{`${minutes}:${seconds.toString().padStart(2, '0')}`}</Badge>;
}

function getStatusVariant(status) {
  switch (status) {
    case 'OPEN':
      return 'outline';
    case 'ACCEPTED':
      return 'custom';
    case 'REJECTED':
      return 'custom';
    case 'ARCHIVED':
      return 'secondary';
    default:
      return 'default';
  }
}

function getStatusClassName(status) {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return '';
  }
}

function getScreenedDays(phoneScreen) {
  if (!phoneScreen || !phoneScreen.createdAt) {
    return 'Not screened';
  }
  const screenDate = parseISO(phoneScreen.createdAt);
  const days = differenceInDays(new Date(), screenDate);
  return days === 0 ? 'Today' : `${days} day${days !== 1 ? 's' : ''} ago`;
}

// ... rest of the helper functions ...
