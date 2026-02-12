'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import { certificatesAPI } from '@/lib/api';
import EditCertificateModal from '@/components/certificates/EditCertificateModal';
import DeleteCertificateModal from '@/components/certificates/DeleteCertificateModal';
import SignatureStatusModal from '@/components/certificates/SignatureStatusModal';

type SortField = 'code' | 'issue_date' | 'burial_place' | 'issue_to' | 'signature_status';
type SortOrder = 'asc' | 'desc';

export default function CertificatesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('issue_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(true);
  const [deletingCertificateId, setDeletingCertificateId] = useState<number | null>(null);
  const [deletingCertificateCode, setDeletingCertificateCode] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [signatureStatusCertificateId, setSignatureStatusCertificateId] = useState<number | null>(null);
  const [signatureStatusCertificateCode, setSignatureStatusCertificateCode] = useState<string>('');
  const [isSignatureStatusModalOpen, setIsSignatureStatusModalOpen] = useState(false);
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
    queryKey: ['certificates', page, search, sortBy, sortOrder],
    queryFn: () => certificatesAPI.getAll({ page, limit: 25, search, sortBy, sortOrder }),
    keepPreviousData: true,
  });

  const certificates = data?.data || [];
  const pagination = data?.pagination;

  const handleAdd = () => {
    setIsCreateMode(true);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleDelete = (certificateId: number, certificateCode: string) => {
    setDeletingCertificateId(certificateId);
    setDeletingCertificateCode(certificateCode);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setDeletingCertificateId(null);
    setDeletingCertificateCode('');
  };

  const handleSignatureStatusClick = (certificateId: number, certificateCode: string) => {
    setSignatureStatusCertificateId(certificateId);
    setSignatureStatusCertificateCode(certificateCode);
    setIsSignatureStatusModalOpen(true);
  };

  const handleSignatureStatusModalClose = () => {
    setIsSignatureStatusModalOpen(false);
    setSignatureStatusCertificateId(null);
    setSignatureStatusCertificateCode('');
  };

  const handleUpdateSuccess = () => {
    // Invalidate and refetch certificates data
    queryClient.invalidateQueries({ queryKey: ['certificates'] });
  };

  return (
    <>
      <Header title="Certificates" />
      <div className="p-6">
        {/* Search and Actions */}
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
          <button
            onClick={handleAdd}
            className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Add Certificate
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Error loading certificates</p>
            <p className="text-xs mt-2">{String(error)}</p>
            <details className="mt-2 text-xs">
              <summary>Debug Info</summary>
              <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center gap-1">
                      Certificate Number
                      {sortBy === 'code' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('issue_date')}
                  >
                    <div className="flex items-center gap-1">
                      Issue Date
                      {sortBy === 'issue_date' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('burial_place')}
                  >
                    <div className="flex items-center gap-1">
                      Burial Place
                      {sortBy === 'burial_place' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('issue_to')}
                  >
                    <div className="flex items-center gap-1">
                      Issue To
                      {sortBy === 'issue_to' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Signature Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {certificates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-text-light">
                      No certificates found
                    </td>
                  </tr>
                ) : (
                  certificates.map((cert: any) => {
                    // Determine certificate status badge
                    const getStatusBadge = () => {
                      const status = cert.cert_status || 'Active';
                      if (status === 'Active') {
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        );
                      } else if (status === 'Expired') {
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Expired
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {status}
                          </span>
                        );
                      }
                    };

                    // Determine signature status badge
                    const getSignatureStatusBadge = () => {
                      if (cert.signature_status === 'Completed') {
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-green-600 underline">
                            Completed ({cert.signature_completed_count || 0}/{cert.signature_total_count || 2})
                          </span>
                        );
                      } else if (cert.signature_status === 'Pending') {
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-orange-600 underline">
                            Pending ({cert.signature_completed_count || 0}/{cert.signature_total_count || 2})
                          </span>
                        );
                      } else {
                        return (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-600">
                            Not Started (0/{cert.signature_total_count || 2})
                          </span>
                        );
                      }
                    };

                    return (
                      <tr key={cert.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-dark">
                          {cert.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                          {cert.issue_date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                          {cert.burial_place}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                          {cert.issue_to}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getStatusBadge()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {cert.signature_status_display ? (
                            <button
                              onClick={() => handleSignatureStatusClick(cert.id, cert.code)}
                              className="cursor-pointer hover:opacity-80 transition-opacity underline"
                              title="Click to view signature details"
                            >
                              <span dangerouslySetInnerHTML={{ __html: cert.signature_status_display }} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSignatureStatusClick(cert.id, cert.code)}
                              className="cursor-pointer hover:opacity-80 transition-opacity underline"
                              title="Click to view signature details"
                            >
                              {getSignatureStatusBadge()}
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {cert.is_used ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Yes
                              </span>
                              {cert.deceased_id && (
                                <a
                                  href={`/deceased/${cert.deceased_id}`}
                                  className="text-primary hover:text-primary-dark underline font-medium"
                                  title="View deceased record"
                                >
                                  Deceased #{cert.deceased_id}
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-3">
                          {cert.document_link && (
                            <button
                              onClick={() => window.open(cert.document_link, '_blank')}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                              title="View PDF"
                            >
                              View
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(cert.id, cert.code)}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-text-light">
                  Showing {((page - 1) * 25) + 1} to {Math.min(page * 25, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
        <EditCertificateModal
          certificateId={null}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleUpdateSuccess}
          isCreateMode={true}
        />

      {/* Delete Modal */}
      <DeleteCertificateModal
        certificateId={deletingCertificateId}
        certificateCode={deletingCertificateCode}
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onSuccess={handleUpdateSuccess}
      />

      {/* Signature Status Modal */}
      <SignatureStatusModal
        certificateId={signatureStatusCertificateId}
        certificateCode={signatureStatusCertificateCode}
        isOpen={isSignatureStatusModalOpen}
        onClose={handleSignatureStatusModalClose}
      />
    </>
  );
}
