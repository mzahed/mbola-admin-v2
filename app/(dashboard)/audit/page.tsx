'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import { auditAPI } from '@/lib/api';

type SortField = 'message' | 'log' | 'email' | 'date_update';
type SortOrder = 'asc' | 'desc';

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('date_update');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit', page, search, sortBy, sortOrder],
    queryFn: () => auditAPI.getAll({ page, limit: 25, search, sortBy, sortOrder }),
    placeholderData: (previousData) => previousData,
  });

  const auditLogs = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) {
      return (
        <span className="text-gray-400">
          <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m4 4l-4-4" />
          </svg>
        </span>
      );
    }
    return sortOrder === 'asc' ? (
      <span className="text-primary">
        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </span>
    ) : (
      <span className="text-primary">
        <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Header title="Audit Trail" />
      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Search by message, log, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">Error loading audit trail</p>
            <p className="text-xs mt-2">
              {error instanceof Error ? error.message : String(error)}
            </p>
            <p className="text-xs mt-1 text-red-600">
              {error instanceof Error && error.message.includes('403')
                ? 'Access denied. Only admin and chairman can view audit trail.'
                : 'Please check your connection and try again.'}
            </p>
          </div>
        ) : (
          <>
            {/* Audit Trail Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('date_update')}
                      >
                        <div className="flex items-center gap-2">
                          Date & Time
                          {getSortIcon('date_update')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center gap-2">
                          User Email
                          {getSortIcon('email')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('message')}
                      >
                        <div className="flex items-center gap-2">
                          Message
                          {getSortIcon('message')}
                        </div>
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('log')}
                      >
                        <div className="flex items-center gap-2">
                          Log Details
                          {getSortIcon('log')}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          No audit logs found
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log: any) => (
                        <tr key={log.id || `${log.date_update}-${log.email}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                            {formatDate(log.date_update)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                            {log.email || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-text-dark">
                            <div className="max-w-md">
                              {log.message || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-text-light">
                            <div className="max-w-lg">
                              <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-2 rounded border">
                                {log.log || 'N/A'}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(page - 1) * pagination.limit + 1}</span> to{' '}
                        <span className="font-medium">
                          {Math.min(page * pagination.limit, pagination.total)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.total}</span> results
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                          .filter((p) => {
                            // Show first page, last page, current page, and pages around current
                            return (
                              p === 1 ||
                              p === pagination.pages ||
                              (p >= page - 1 && p <= page + 1)
                            );
                          })
                          .map((p, idx, arr) => {
                            // Add ellipsis if there's a gap
                            const showEllipsisBefore = idx > 0 && arr[idx - 1] < p - 1;
                            return (
                              <div key={p} className="flex items-center">
                                {showEllipsisBefore && (
                                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    ...
                                  </span>
                                )}
                                <button
                                  onClick={() => setPage(p)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    p === page
                                      ? 'z-10 bg-primary border-primary text-white'
                                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  {p}
                                </button>
                              </div>
                            );
                          })}
                        <button
                          onClick={() => setPage(page + 1)}
                          disabled={page >= pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
