'use client';

import { useState } from 'react';
import { deceasedAPI } from '@/lib/api';

interface DeleteDeceasedModalProps {
  deceasedId: number | null;
  deceasedName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteDeceasedModal({
  deceasedId,
  deceasedName,
  isOpen,
  onClose,
  onSuccess,
}: DeleteDeceasedModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deceasedId) return;

    setLoading(true);
    setError(null);

    try {
      const response: any = await deceasedAPI.delete(deceasedId);
      
      if (response.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.message || 'Failed to delete deceased record');
      }
    } catch (err: any) {
      console.error('Error deleting deceased record:', err);
      
      let errorMessage = 'Failed to delete deceased record';
      
      if (err.isNetworkError || (!err.response && err.request)) {
        errorMessage = err.message || 'Network error: Could not connect to server. Please check your connection or try again.';
      } else if (err.response?.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else {
          errorMessage = JSON.stringify(err.response.data, null, 2);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-text-dark">Delete Deceased Record</h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-semibold">Error:</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          <p className="text-text-dark mb-6">
            Are you sure you want to delete the deceased record for <strong>{deceasedName}</strong>? 
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
