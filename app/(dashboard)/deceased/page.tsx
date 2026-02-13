'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { deceasedAPI } from '@/lib/api';
import DeleteDeceasedModal from '@/components/deceased/DeleteDeceasedModal';

type SortField = 'full_name' | 'certificate_code' | 'grave_location' | 'date_of_burial' | 'date_of_birth' | 'date_of_death';
type SortOrder = 'asc' | 'desc';

export default function DeceasedPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('date_of_death');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deletingDeceasedId, setDeletingDeceasedId] = useState<number | null>(null);
  const [deletingDeceasedName, setDeletingDeceasedName] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1); // Reset to first page when sorting
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['deceased', page, search, sortBy, sortOrder],
    queryFn: () => deceasedAPI.getAll({ page, limit: 25, search, sortBy, sortOrder }),
    placeholderData: (previousData) => previousData,
  });

  const deceased = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const handleDelete = (deceasedId: number, deceasedName: string) => {
    setDeletingDeceasedId(deceasedId);
    setDeletingDeceasedName(deceasedName);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setDeletingDeceasedId(null);
    setDeletingDeceasedName('');
  };

  const handleDeleteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['deceased'] });
  };

  return (
    <>
      <Header title="Deceased" />
      <div className="p-6">
        {/* Search */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Error loading deceased records</p>
            <p className="text-xs mt-2">{String(error)}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('full_name')}
                  >
                    <div className="flex items-center gap-1">
                      Full Name
                      {sortBy === 'full_name' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('certificate_code')}
                  >
                    <div className="flex items-center gap-1">
                      Certificate Number
                      {sortBy === 'certificate_code' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('grave_location')}
                  >
                    <div className="flex items-center gap-1">
                      Grave Location
                      {sortBy === 'grave_location' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('date_of_burial')}
                  >
                    <div className="flex items-center gap-1">
                      Date of Burial
                      {sortBy === 'date_of_burial' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('date_of_birth')}
                  >
                    <div className="flex items-center gap-1">
                      Date of Birth
                      {sortBy === 'date_of_birth' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('date_of_death')}
                  >
                    <div className="flex items-center gap-1">
                      Date of Death
                      {sortBy === 'date_of_death' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deceased.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-text-light">
                      No deceased records found
                    </td>
                  </tr>
                ) : (
                  deceased.map((record: any) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-dark">
                        <Link
                          href={`/deceased/${record.id}`}
                          className="text-primary hover:text-primary-dark hover:underline"
                        >
                          {record.full_name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                        {record.certificate_code || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                        {record.grave_location || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                        {record.date_of_burial || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                        {record.date_of_birth || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                        {record.date_of_death || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.invoice_status ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            record.invoice_status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : record.invoice_status === 'open' || record.invoice_status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {record.invoice_status.charAt(0).toUpperCase() + record.invoice_status.slice(1)}
                          </span>
                        ) : (
                          <span className="text-text-light">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(record.id, record.full_name)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete deceased record"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
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
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        let pageNum;
                        if (pagination.pages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= pagination.pages - 2) {
                          pageNum = pagination.pages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pageNum
                                ? 'z-10 bg-primary border-primary text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setPage(Math.min(pagination.pages, page + 1))}
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
        )}
      </div>

      <DeleteDeceasedModal
        deceasedId={deletingDeceasedId}
        deceasedName={deletingDeceasedName}
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onSuccess={handleDeleteSuccess}
      />
    </>
  );
}
