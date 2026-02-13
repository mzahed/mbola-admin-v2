'use client';

import { useState, useEffect } from 'react';
import { usersAPI } from '@/lib/api';

interface UserType {
  id: number;
  title: string;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddUserModal({
  isOpen,
  onClose,
  onSuccess,
}: AddUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingTypes, setFetchingTypes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [formData, setFormData] = useState({
    user_display: '',
    email: '',
    user_type_id: 0,
    password: '',
    is_active: 1,
  });

  // Fetch user types when modal opens
  useEffect(() => {
    if (isOpen) {
      setFetchingTypes(true);
      usersAPI
        .getUserTypes()
        .then((response: any) => {
          if (response.success && response.data) {
            setUserTypes(response.data);
            // Set default to first user type if available
            if (response.data.length > 0 && formData.user_type_id === 0) {
              setFormData(prev => ({ ...prev, user_type_id: response.data[0].id }));
            }
          }
        })
        .catch((err: any) => {
          console.error('Error fetching user types:', err);
          setError('Failed to load user types');
        })
        .finally(() => {
          setFetchingTypes(false);
        });
    }
  }, [isOpen]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        user_display: '',
        email: '',
        user_type_id: userTypes.length > 0 ? userTypes[0].id : 0,
        password: '',
        is_active: 1,
      });
      setError(null);
    }
  }, [isOpen, userTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate form
      if (!formData.user_display.trim()) {
        setError('Display name is required');
        setLoading(false);
        return;
      }
      if (!formData.email.trim()) {
        setError('Email is required');
        setLoading(false);
        return;
      }
      if (!formData.email.includes('@')) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }
      if (!formData.user_type_id || formData.user_type_id === 0) {
        setError('User type is required');
        setLoading(false);
        return;
      }

      const result: any = await usersAPI.create({
        user_display: formData.user_display.trim(),
        email: formData.email.trim(),
        user_type_id: formData.user_type_id,
        password: formData.password.trim() || undefined, // Only send if provided
        is_active: formData.is_active,
      });

      if (result && result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result?.message || 'Failed to create user');
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create user. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-text-dark">Add User</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.user_display}
                  onChange={(e) => setFormData({ ...formData, user_display: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              {/* User Type */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  User Type <span className="text-red-500">*</span>
                </label>
                {fetchingTypes ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-gray-500">Loading user types...</span>
                  </div>
                ) : (
                  <select
                    value={formData.user_type_id}
                    onChange={(e) => setFormData({ ...formData, user_type_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    disabled={loading}
                  >
                    <option value="0">Select User Type...</option>
                    {userTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Leave blank to use email as password"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  If left blank, the email address will be used as the default password
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-1">
                  Status
                </label>
                <select
                  value={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || fetchingTypes}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create User'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
