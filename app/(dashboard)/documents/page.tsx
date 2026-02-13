'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import { documentsAPI } from '@/lib/api';
import AddDocumentModal from '@/components/documents/AddDocumentModal';
import ViewContactsModal from '@/components/documents/ViewContactsModal';

type SortField = 'id' | 'document_name' | 'contact_count' | 'status' | 'create_date';
type SortOrder = 'asc' | 'desc';

export default function DocumentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingContactsDocId, setViewingContactsDocId] = useState<number | null>(null);
  const [viewingContactsDocName, setViewingContactsDocName] = useState('');
  const queryClient = useQueryClient();

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['documents', page, search, sortBy, sortOrder],
    queryFn: () => documentsAPI.getAll({ page, limit: 25, search, sortBy, sortOrder }),
    placeholderData: (previousData) => previousData,
  });

  const documents = (data as any)?.data || [];
  const pagination = (data as any)?.pagination;

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'sent') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Sent
        </span>
      );
    } else if (statusLower === 'completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Completed
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Draft
        </span>
      );
    }
  };

  const handleAdd = () => {
    setIsAddModalOpen(true);
  };

  const handleAddSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['documents'] });
  };

  const handleViewContacts = (docId: number, docName: string) => {
    setViewingContactsDocId(docId);
    setViewingContactsDocName(docName);
  };

  const handleCloseContactsModal = () => {
    setViewingContactsDocId(null);
    setViewingContactsDocName('');
  };

  const handleSendDocuments = async (docId: number) => {
    if (!confirm('Send forms to all contacts for this document?')) {
      return;
    }

    try {
      const result: any = await documentsAPI.sendDocuments(docId);
      if (result?.status === '1' || result?.status === 1 || result?.success) {
        alert(result.message || 'Forms sent successfully.');
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      } else {
        alert(result.message || 'Failed to send forms.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error sending forms. Please try again.');
    }
  };

  const handleDelete = async (docId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const result: any = await documentsAPI.delete(docId);
      if (result?.status === '1' || result?.status === 1 || result?.success) {
        alert('Document deleted successfully.');
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      } else {
        alert(result.message || 'Failed to delete document.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting document. Please try again.');
    }
  };

  return (
    <>
      <Header title="Forms" />
      <div className="p-6">
        {/* Search and Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by form name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            onClick={handleAdd}
            className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            + Add Form
          </button>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Error loading documents</p>
            <p className="text-xs mt-2">{String(error)}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      ID
                      {sortBy === 'id' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('document_name')}
                  >
                    <div className="flex items-center gap-1">
                      Form Name
                      {sortBy === 'document_name' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('contact_count')}
                  >
                    <div className="flex items-center gap-1">
                      Contacts
                      {sortBy === 'contact_count' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortBy === 'status' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('create_date')}
                  >
                    <div className="flex items-center gap-1">
                      Created
                      {sortBy === 'create_date' && (
                        <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-text-light">
                      No documents found
                    </td>
                  </tr>
                ) : (
                  documents.map((doc: any) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-dark">
                        {doc.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                        {doc.document_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                        {doc.contact_count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {getStatusBadge(doc.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">
                        {doc.create_date || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewContacts(doc.id, doc.document_name)}
                            className="text-primary hover:text-primary-dark underline"
                          >
                            View
                          </button>
                          {doc.status === 'draft' && (
                            <button
                              onClick={() => handleSendDocuments(doc.id)}
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Send
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-600 hover:text-red-800 underline"
                          >
                            Delete
                          </button>
                        </div>
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

      {/* Modals */}
      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {viewingContactsDocId && (
        <ViewContactsModal
          isOpen={!!viewingContactsDocId}
          onClose={handleCloseContactsModal}
          documentId={viewingContactsDocId}
          documentName={viewingContactsDocName}
        />
      )}
    </>
  );
}
