import React from 'react';
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export function Pagination({ currentPage, totalPages, onPageChange, loading = false }: PaginationProps) {
  return (
    <div className="flex justify-between items-center mt-4">
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
      >
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
      >
        Next
      </Button>
    </div>
  );
}