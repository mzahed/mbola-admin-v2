'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsAPI } from '@/lib/api';

interface ViewContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  documentName: string;
}

export default function ViewContactsModal({ isOpen, onClose, documentId, documentName }: ViewContactsModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'manual'>('upload');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: contactsData, isLoading, refetch, error: contactsError } = useQuery({
    queryKey: ['contacts', documentId],
    queryFn: async () => {
      try {
        console.log('Calling getContacts with documentId:', documentId);
        const result = await documentsAPI.getContacts(documentId);
        console.log('getContacts API response:', result);
        console.log('Response type:', typeof result);
        console.log('Is array:', Array.isArray(result));
        
        // Handle different response structures
        if (Array.isArray(result)) {
          // Direct array response (old format)
          console.log('Direct array response, length:', result.length);
          return { success: true, data: result };
        } else if (result && typeof result === 'object') {
          // Object response
          if (result.data && Array.isArray(result.data)) {
            console.log('Response has data array, length:', result.data.length);
            return result;
          } else if ((result as any)?.success && (result as any)?.data && Array.isArray((result as any).data)) {
            console.log('Response has success.data array, length:', result.data.length);
            return result;
          }
        }
        
        console.warn('Unexpected response format:', result);
        return { success: false, data: [] };
      } catch (error) {
        console.error('Error in getContacts queryFn:', error);
        throw error;
      }
    },
    enabled: isOpen && documentId > 0,
  });

  // Handle different response structures
  let contacts: any[] = [];
  if (contactsData) {
    if (Array.isArray(contactsData)) {
      contacts = contactsData;
    } else if (contactsData.data && Array.isArray(contactsData.data)) {
      contacts = contactsData.data;
    } else if ((contactsData as any)?.success && (contactsData as any)?.data && Array.isArray((contactsData as any).data)) {
      contacts = contactsData.data;
    }
  }
  
  console.log('Final contacts array:', contacts);
  console.log('Contacts length:', contacts.length);

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file.');
        return;
      }
      setCsvFile(selectedFile);
      setError('');
    }
  };

  const handleUploadContacts = async () => {
    if (!csvFile) {
      setError('Please select a CSV file.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('contact_document_id', documentId.toString());
      formData.append('contact_file', csvFile);
      formData.append('action', 'upload_contacts');

      const result: any = await documentsAPI.uploadContacts(formData);
      
      if (result?.status === '1' || result?.status === 1 || result?.success) {
        setSuccess(result?.message || 'Contacts uploaded successfully.');
        setCsvFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        refetch();
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      } else {
        setError(result?.message || 'Failed to upload contacts.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error uploading contacts. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddManualContact = async () => {
    if (!manualName.trim() || !manualPhone.trim()) {
      setError('Name and Phone Number are required.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const customFieldsJson = Object.keys(customFields).length > 0 ? JSON.stringify(customFields) : undefined;

      const result = await documentsAPI.addManualContact({
        contact_document_id: documentId,
        name: manualName.trim(),
        phone_no: manualPhone.trim(),
        custom_fields: customFieldsJson,
      });

      const addResult: any = result;
      if (addResult?.status === '1' || addResult?.status === 1 || addResult?.success) {
        setSuccess(addResult.message || 'Contact added successfully.');
        setManualName('');
        setManualPhone('');
        setCustomFields({});
        refetch();
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      } else {
        setError(addResult?.message || 'Failed to add contact.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error adding contact. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendDocuments = async () => {
    if (!confirm('Send forms to all contacts?')) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result: any = await documentsAPI.sendDocuments(documentId);
      
      if (result?.status === '1' || result?.status === 1 || result?.success) {
        setSuccess(result?.message || 'Forms sent successfully.');
        refetch();
        queryClient.invalidateQueries({ queryKey: ['documents'] });
      } else {
        setError(result?.message || 'Failed to send forms.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error sending forms. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendReminders = async () => {
    if (!confirm('Send reminders to all pending contacts?')) {
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await documentsAPI.sendReminders(documentId);

      const sendResult: any = result;
      if (sendResult?.status === '1' || sendResult?.status === 1 || sendResult?.success) {
        setSuccess(sendResult?.message || 'Reminders sent successfully.');
        refetch();
      } else {
        setError(sendResult?.message || 'Failed to send reminders.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error sending reminders. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCustomField = () => {
    const fieldName = prompt('Enter custom field name:');
    if (fieldName && fieldName.trim()) {
      setCustomFields({ ...customFields, [fieldName.trim()]: '' });
    }
  };

  const removeCustomField = (fieldName: string) => {
    const newFields = { ...customFields };
    delete newFields[fieldName];
    setCustomFields(newFields);
  };

  const updateCustomField = (fieldName: string, value: string) => {
    setCustomFields({ ...customFields, [fieldName]: value });
  };

  if (!isOpen) return null;

  // Get all custom field names from contacts
  const allCustomFields = new Set<string>();
  contacts.forEach((contact: any) => {
    if (contact.custom_fields) {
      try {
        const fields = typeof contact.custom_fields === 'string' 
          ? JSON.parse(contact.custom_fields) 
          : contact.custom_fields;
        Object.keys(fields).forEach(key => allCustomFields.add(key));
      } catch (e) {
        // Ignore parse errors
      }
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-dark">Contact List - {documentName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Upload CSV
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'manual'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Add Manually
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'upload' && (
            <div className="mb-6">
              <div className="mb-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  CSV format: Name,Phone,Position,Email,etc. (first row is header)
                </p>
              </div>
              <button
                onClick={handleUploadContacts}
                disabled={isSubmitting || !csvFile}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Uploading...' : 'Upload Contacts'}
              </button>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              {Object.keys(customFields).map((fieldName) => (
                <div key={fieldName} className="mb-4 flex gap-2">
                  <input
                    type="text"
                    placeholder={fieldName}
                    value={customFields[fieldName]}
                    onChange={(e) => updateCustomField(fieldName, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeCustomField(fieldName)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCustomField}
                className="mb-4 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                + Add Custom Field
              </button>
              <button
                onClick={handleAddManualContact}
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Contact'}
              </button>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
              {success}
            </div>
          )}

          {/* Contact List */}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-text-dark mb-3">Contacts ({contacts.length})</h4>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : contactsError ? (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                Error loading contacts: {String(contactsError)}
              </div>
            ) : contacts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No contacts uploaded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      {Array.from(allCustomFields).map((field) => (
                        <th key={field} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </th>
                      ))}
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contacts.map((contact: any) => {
                      const isCompleted = contact.signature_completed && 
                        contact.signature_completed !== '0000-00-00 00:00:00' &&
                        contact.signature_completed !== '0000-00-00' &&
                        contact.signature_completed !== null;
                      
                      const customFieldValues: Record<string, string> = {};
                      if (contact.custom_fields) {
                        try {
                          Object.assign(customFieldValues, typeof contact.custom_fields === 'string' 
                            ? JSON.parse(contact.custom_fields) 
                            : contact.custom_fields);
                        } catch (e) {
                          // Ignore parse errors
                        }
                      }

                      return (
                        <tr key={contact.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text-light">{contact.name}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-text-light">{contact.phone_no}</td>
                          {Array.from(allCustomFields).map((field) => (
                            <td key={field} className="px-4 py-3 whitespace-nowrap text-sm text-text-light">
                              {customFieldValues[field] || '-'}
                            </td>
                          ))}
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            {isCompleted ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Signed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                Pending
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSendReminders}
            disabled={isSubmitting}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Reminders
          </button>
          <button
            onClick={handleSendDocuments}
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Forms
          </button>
        </div>
      </div>
    </div>
  );
}
