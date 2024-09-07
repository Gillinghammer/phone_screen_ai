import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function JobPageBreadcrumb({ jobTitle }) {
  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link href="/jobs" className="text-gray-700 hover:text-blue-600">
            Jobs
          </Link>
        </li>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <li className="text-gray-500" aria-current="page">
          {jobTitle}
        </li>
      </ol>
    </nav>
  );
}
