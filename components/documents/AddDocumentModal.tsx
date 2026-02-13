'use client';

import { useState, useRef } from 'react';
import { documentsAPI } from '@/lib/api';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDocumentModal({ isOpen, onClose, onSuccess }: AddDocumentModalProps) {
  const [documentName, setDocumentName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('No file chosen');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('Only PDF files are supported.');
        setFile(null);
        setFileName('No file chosen');
        return;
      }
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
      
      // Auto-fill document name from filename (without extension)
      if (!documentName) {
        const nameWithoutExt = selectedFile.name.replace(/\.pdf$/i, '');
        setDocumentName(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please select a PDF file.');
      return;
    }

    if (!documentName.trim()) {
      setError('Please enter a form name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('document_name', documentName.trim());
      formData.append('document_file', file);

      const result: any = await documentsAPI.create(formData);
      
      if (result?.status === '1' || result?.status === 1 || result?.success) {
        onSuccess();
        handleClose();
      } else {
        setError(result.message || 'Failed to create document.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating document. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setDocumentName('');
    setFile(null);
    setFileName('No file chosen');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-dark">Create Form</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label htmlFor="document_file" className="block text-sm font-medium text-text-dark mb-2">
              Form File (PDF Only)
            </label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                id="document_file"
                accept=".pdf"
                onChange={handleFileChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
              />
              <p className="mt-1 text-xs text-gray-500">
                {fileName}
              </p>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Only PDF files are supported. Convert Word documents to PDF before uploading.
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="document_name" className="block text-sm font-medium text-text-dark mb-2">
              Form Name
            </label>
            <input
              type="text"
              id="document_name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              required
              placeholder="Enter form name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Save Form'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
