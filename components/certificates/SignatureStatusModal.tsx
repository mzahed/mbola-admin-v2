'use client';

import { useState, useEffect } from 'react';
import { certificatesAPI } from '@/lib/api';

interface SignatureStatusModalProps {
  certificateId: number | null;
  certificateCode: string;
  isOpen: boolean;
  onClose: () => void;
}

interface SignatureDetail {
  role: string;
  completed: boolean;
  user_display?: string;
  signature_update?: string;
}

export default function SignatureStatusModal({
  certificateId,
  certificateCode,
  isOpen,
  onClose,
}: SignatureStatusModalProps) {
  const [signatureDetails, setSignatureDetails] = useState<SignatureDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && certificateId) {
      fetchSignatureDetails();
    }
  }, [isOpen, certificateId]);

  const fetchSignatureDetails = async () => {
    if (!certificateId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch certificate details which should include signature_details
      const response: any = await certificatesAPI.getById(certificateId);
      
      if (response?.success && response?.data) {
        const cert = response.data;
        
        // Use signature_details if available, otherwise construct from available data
        if (cert.signature_details && Array.isArray(cert.signature_details)) {
          setSignatureDetails(cert.signature_details);
        } else {
          // Fallback: construct from signature status info
          const details: SignatureDetail[] = [];
          
          // Check chairman signature
          if (cert.signature_link_chair) {
            details.push({
              role: 'Chairman',
              completed: cert.signature_completed_count >= 1 || cert.is_signed == 1,
            });
          }
          
          // Check board member signature
          if (cert.signature_link_board) {
            details.push({
              role: 'Board Member',
              completed: cert.signature_completed_count >= 2 || cert.is_signed == 1,
            });
          }
          
          setSignatureDetails(details);
        }
      } else {
        setError('Failed to load signature details');
      }
    } catch (err) {
      console.error('Error fetching signature details:', err);
      setError('Error loading signature details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Center modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Signature Status - {certificateCode}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-red-600 py-4">{error}</div>
            ) : (
              <div className="space-y-4">
                {signatureDetails.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No signature information available
                  </p>
                ) : (
                  signatureDetails.map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {detail.completed ? (
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white">
                              <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white">
                              <svg
                                className="w-6 h-6 text-orange-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {detail.role}
                          </p>
                          {detail.user_display && (
                            <p className="text-xs text-gray-500">
                              {detail.user_display}
                            </p>
                          )}
                          {detail.signature_update && detail.completed && (
                            <p className="text-xs text-gray-500">
                              Signed: {new Date(detail.signature_update).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        {detail.completed ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-green-600">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-orange-600">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
