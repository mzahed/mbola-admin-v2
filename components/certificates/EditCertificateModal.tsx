'use client';

import { useState, useEffect } from 'react';
import { certificatesAPI, boardMembersAPI } from '@/lib/api';

interface Certificate {
  id: number;
  code: string;
  burial_place: string;
  issue_to: string;
  issue_address: string;
  issue_phone_no: string;
  issue_email: string;
  issue_date: string;
  board_id: number;
  board_display: string;
  cert_status: string;
}

interface BoardMember {
  id: number;
  user_display: string;
  email: string;
}

interface EditCertificateModalProps {
  certificateId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isCreateMode?: boolean;
}

export default function EditCertificateModal({
  certificateId,
  isOpen,
  onClose,
  onSuccess,
  isCreateMode = false,
}: EditCertificateModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loadingBoardMembers, setLoadingBoardMembers] = useState(false);
  const [formData, setFormData] = useState<Partial<Certificate>>({
    burial_place: '',
    issue_to: '',
    issue_address: '',
    issue_phone_no: '',
    issue_email: 'certificates@mbola.org',
    code: '',
    board_id: 0,
  });

  // Fetch board members when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingBoardMembers(true);
      boardMembersAPI
        .getAll()
        .then((response: any) => {
          if (response.success && response.data) {
            setBoardMembers(response.data);
          }
        })
        .catch((err: any) => {
          console.error('Error fetching board members:', err);
        })
        .finally(() => {
          setLoadingBoardMembers(false);
        });
    }
  }, [isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (isCreateMode) {
        // Reset form for create mode
        setFormData({
          burial_place: '',
          issue_to: '',
          issue_address: '',
          issue_phone_no: '',
          issue_email: 'certificates@mbola.org',
          code: '',
          board_id: 0,
        });
        setError(null);
      }
    } else {
      // Reset form when modal closes
      setFormData({
        burial_place: '',
        issue_to: '',
        issue_address: '',
        issue_phone_no: '',
        issue_email: 'certificates@mbola.org',
        code: '',
        board_id: 0,
      });
      setError(null);
    }
  }, [isOpen, isCreateMode]);

  // Fetch certificate data when modal opens (edit mode only)
  useEffect(() => {
    if (isOpen && certificateId && !isCreateMode) {
      setFetching(true);
      setError(null);
      certificatesAPI
        .getById(certificateId)
        .then((response: any) => {
          if (response.success && response.data) {
            setFormData({
              burial_place: response.data.burial_place || '',
              issue_to: response.data.issue_to || '',
              issue_address: response.data.issue_address || '',
              issue_phone_no: response.data.issue_phone_no || '',
              issue_email: response.data.issue_email || '',
              code: response.data.code || '',
              board_id: response.data.board_id || 0,
            });
          } else {
            setError('Failed to load certificate data');
          }
        })
        .catch((err: any) => {
          console.error('Error fetching certificate:', err);
          setError(err.response?.data?.message || 'Failed to load certificate data');
        })
        .finally(() => {
          setFetching(false);
        });
    }
  }, [isOpen, certificateId, isCreateMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.burial_place) {
      setError('Burial place is required');
      return;
    }
    if (!formData.issue_to) {
      setError('Issue to is required');
      return;
    }

    // Validate board member is selected (required for DocuSign on create)
    if (isCreateMode && (!formData.board_id || formData.board_id === 0)) {
      setError('Please select a board member. This is required for DocuSign signature process.');
      return;
    }

    // Validate certificate ID for edit mode
    if (!isCreateMode && !certificateId) {
      setError('Certificate ID is missing. Please close and try editing again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Log form data before sending
      console.log('Submitting certificate data:', formData);
      console.log('Board ID:', formData.board_id);
      
      let response: any;
      
      if (isCreateMode) {
        // Create new certificate
        // Ensure board_id is included and is a number
        const createData = {
          ...formData,
          board_id: formData.board_id ? parseInt(String(formData.board_id)) : 0
        };
        console.log('Creating certificate with data:', createData);
        response = await certificatesAPI.create(createData);
      } else {
        // Update existing certificate
        if (!certificateId) {
          setError('Certificate ID is missing. Please try again.');
          setLoading(false);
          return;
        }
        const updateData = {
          ...formData,
          board_id: formData.board_id ? parseInt(String(formData.board_id)) : 0
        };
        console.log('Updating certificate with data:', updateData);
        console.log('Certificate ID:', certificateId);
        response = await certificatesAPI.update(certificateId, updateData);
        console.log('Update response:', response);
      }
      
      if (response && response.success) {
        // Log debug info to console
        if (response.debug_info) {
          console.group('📋 Certificate Creation Debug Info');
          console.log('Full debug info:', response.debug_info);
          
          if (response.debug_info.email_sms) {
            console.group('📧 Email/SMS Status');
            console.log('Status:', response.debug_info.email_sms.status);
            console.log('Certificate ID:', response.debug_info.email_sms.certificate_id);
            console.log('Certificate Code:', response.debug_info.email_sms.certificate_code);
            if (response.debug_info.email_sms.result) {
              console.log('Result:', response.debug_info.email_sms.result);
              if (response.debug_info.email_sms.result.debug_info) {
                console.group('📱 SMS Details');
                console.log('Certificate Sign Records:', response.debug_info.email_sms.result.debug_info.certificate_sign_count);
                console.log('Chairman Phone:', response.debug_info.email_sms.result.debug_info.chairman_phone);
                console.log('Board Phone:', response.debug_info.email_sms.result.debug_info.board_phone);
                if (response.debug_info.email_sms.result.debug_info.sms_attempts) {
                  console.group('📱 SMS Attempts');
                  const smsAttempts = response.debug_info.email_sms.result.debug_info.sms_attempts;
                  
                  if (smsAttempts.chairman) {
                    console.log('Chairman SMS:', smsAttempts.chairman);
                    if (smsAttempts.chairman.status === 'failed' && smsAttempts.chairman.error) {
                      console.error('❌ Chairman SMS Failed:', smsAttempts.chairman.error);
                      if (smsAttempts.chairman.error.includes('401') || smsAttempts.chairman.error.includes('Authenticate')) {
                        console.error('⚠️ Twilio Authentication Error: Please check TWILIO_SID and TWILIO_TOKEN in constants.php');
                      }
                    }
                  }
                  
                  if (smsAttempts.board) {
                    console.log('Board SMS:', smsAttempts.board);
                    if (smsAttempts.board.status === 'failed' && smsAttempts.board.error) {
                      console.error('❌ Board SMS Failed:', smsAttempts.board.error);
                      if (smsAttempts.board.error.includes('401') || smsAttempts.board.error.includes('Authenticate')) {
                        console.error('⚠️ Twilio Authentication Error: Please check TWILIO_SID and TWILIO_TOKEN in constants.php');
                      }
                    }
                  }
                  
                  console.groupEnd();
                }
                console.groupEnd();
              }
            }
            if (response.debug_info.email_sms.error) {
              console.error('Error:', response.debug_info.email_sms.error);
            }
            console.groupEnd();
          }
          console.groupEnd();
        }
        
        // Check for DocuSign warnings
        if (response.docusign_error) {
          // Show warning but still close modal (certificate was created)
          alert(`Certificate created successfully, but DocuSign failed:\n\n${response.docusign_error}\n\nPlease check the certificate and try sending to DocuSign manually.`);
        }
        onSuccess();
        onClose();
      } else {
        const errorMsg = response?.message || `Failed to ${isCreateMode ? 'create' : 'update'} certificate`;
        console.error('API returned failure:', response);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error(`Error ${isCreateMode ? 'creating' : 'updating'} certificate:`, err);
      
      // Extract error message from various possible locations
      let errorMessage = `Failed to ${isCreateMode ? 'create' : 'update'} certificate`;
      
      if (err.response?.data) {
        // Try to get message from response data
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else {
          // Show full error details for debugging (including DocuSign errors)
          const errorData = err.response.data;
          if (errorData.docusign_error) {
            errorMessage = `Certificate ${isCreateMode ? 'created' : 'updated'}, but DocuSign failed:\n\n${errorData.docusign_error}\n\nFull error: ${JSON.stringify(errorData, null, 2)}`;
          } else {
            errorMessage = JSON.stringify(errorData, null, 2);
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Log full error for debugging
      console.error('Full error response:', err.response?.data);
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-text-dark">
            {isCreateMode ? 'Add Certificate' : 'Edit Certificate'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-semibold">Error:</p>
              <p className="text-sm mt-1 whitespace-pre-wrap">{error}</p>
            </div>
          )}

          {fetching && !isCreateMode ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Certificate Number
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code || ''}
                    onChange={handleChange}
                    readOnly={!isCreateMode}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                      !isCreateMode ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="Certificate Number"
                  />
                  {!isCreateMode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Certificate number cannot be changed after creation
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Burial Place <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="burial_place"
                    value={formData.burial_place || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select Burial Place</option>
                    <option value="Wadi-us-Salam">Wadi-us-Salam</option>
                    <option value="Wadi-e-Hussain">Wadi-e-Hussain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Issue To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="issue_to"
                    value={formData.issue_to || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Issue To"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Issue Address
                  </label>
                  <input
                    type="text"
                    name="issue_address"
                    value={formData.issue_address || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Issue Address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Issue Phone No
                  </label>
                  <input
                    type="text"
                    name="issue_phone_no"
                    value={formData.issue_phone_no || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Issue Phone No"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Issue Email
                  </label>
                  <input
                    type="email"
                    name="issue_email"
                    value={formData.issue_email || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Issue Email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-1">
                    Board Member <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="board_id"
                    value={formData.board_id || 0}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    disabled={loadingBoardMembers}
                  >
                    <option value="0">Select Board Member</option>
                    {boardMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.user_display} {member.email ? `(${member.email})` : ''}
                      </option>
                    ))}
                  </select>
                  {loadingBoardMembers && (
                    <p className="text-sm text-gray-500 mt-1">Loading board members...</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Required for DocuSign signature process. The certificate will be automatically sent to the board member and chairman for signing.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-text-dark hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (isCreateMode ? 'Creating...' : 'Saving...') : (isCreateMode ? 'Create Certificate' : 'Save Changes')}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
