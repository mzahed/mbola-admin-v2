import axios from 'axios';

// API Base URL - defaults to production, can be overridden with env var
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mbola.org/applications/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
  timeout: 10000, // 10 second timeout
});

// Request interceptor - add user authentication from localStorage
api.interceptors.request.use(
  (config) => {
    // Get user from localStorage (Zustand persist)
    if (typeof window !== 'undefined') {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const authData = JSON.parse(authStorage);
          if (authData?.state?.user) {
            const user = authData.state.user;
            // Add user info to headers for authentication
            if (user.id) {
              config.headers['X-User-Id'] = user.id.toString();
            }
            if (user.email) {
              config.headers['X-User-Email'] = user.email;
            }
            
            // Also add to request data if it's a POST/PUT request
            if ((config.method === 'post' || config.method === 'put') && config.data) {
              // Create a new object to avoid mutating the original
              const newData = typeof config.data === 'object' && !Array.isArray(config.data)
                ? { ...config.data }
                : config.data;
              
              if (typeof newData === 'object' && !Array.isArray(newData)) {
                if (user.id) {
                  newData.user_id = user.id;
                }
                if (user.email) {
                  newData.user_email = user.email;
                }
                config.data = newData;
              }
            }
          }
        }
      } catch (e) {
        // Silently handle storage errors - don't fail the request
      }
    }
    return config;
  },
  (error) => {
    // Silently handle request interceptor errors
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response received:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
    }
    return response.data;
  },
  (error) => {
    // Better error handling
    if (error.response) {
      // Server responded with error status
      // Only log non-401 errors to avoid spam
      if (error.response.status !== 401) {
        console.error('API Error:', error.response.status, error.response.data?.message || error.response.data);
      }
    } else if (error.request) {
      // Request made but no response (network error, CORS, etc.)
      // Create a more user-friendly error message
      const networkError = new Error('Network error: Could not connect to server. Please check your connection or try again.');
      (networkError as any).isNetworkError = true;
      (networkError as any).originalError = error;
      return Promise.reject(networkError);
    }
    
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// API methods
export const authAPI = {
  test: () =>
    api.get('/test'),
  
  login: (email: string, password: string) =>
    api.post('/login', { email, password }),
  
  logout: () =>
    api.post('/logout'),
  
  getMe: () =>
    api.get('/me'),
};

export const dashboardAPI = {
  getStats: () =>
    api.get('/dashboard'),
};

export const certificatesAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) =>
    api.get('/certificates', { params }),
  
  getById: (id: number) =>
    api.get(`/certificate`, { params: { id } }),
  
  create: (data: any) =>
    api.post('/certificate_create', data),
  
  update: (id: number, data: any) =>
    api.post('/certificate_update', { id, ...data }),
  
  delete: (id: number) => {
    // Ensure we're sending the data correctly
    return api.post('/certificate_delete', { id }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};

export const boardMembersAPI = {
  getAll: (params?: { search?: string; limit?: number }) =>
    api.get('/board_members', { params }),
};

export const deceasedAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) =>
    api.get('/deceased', { params }),
  getById: (id: number) =>
    api.get('/deceased_detail', { params: { id } }),
  generateForms: (id: number) =>
    api.post('/generate_forms', { id }),
  generateHeadstonePDF: (id: number) =>
    api.post('/generate_headstone_pdf', { id }),
  sendInvoiceSMS: (deceasedId: number) =>
    api.post('/send_invoice_sms', { deceased_id: deceasedId }),
  getInvoiceStatus: (deceasedId: number) =>
    api.get('/get_invoice_status', { params: { deceased_id: deceasedId } }),
  verifyCertificate: (deceasedId: number, verified: boolean) => {
    console.log('verifyCertificate API call with:', { deceasedId, verified });
    return api.post('/verify_certificate', { deceased_id: deceasedId, verified });
  },
  updateBurialDetails: (deceasedId: number, data: {
    cemetery?: string;
    grave_location?: string;
    grave_no?: string;
    date_of_burial?: string;
    burial_time?: string;
    mbola_cemetery_lead?: string;
    prayer_talqeen_lead?: string;
  }) =>
    api.post('/update_burial_details', { deceased_id: deceasedId, ...data }),
  sendCommunityCommunication: (deceasedId: number) =>
    api.post('/send_community_communication', { deceased_id: deceasedId }),
  delete: (id: number) =>
    api.post('/deceased_delete', { id }),
};

export const documentsAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) =>
    api.get('/documents', { params }),
  create: (formData: FormData) =>
    api.post('/documents_action?action=create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (formData: FormData) =>
    api.post('/documents_action?action=update', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) =>
    api.post('/documents_action', { action: 'delete', id }),
  getContacts: (contactDocumentId: number) => {
    console.log('documentsAPI.getContacts called with contactDocumentId:', contactDocumentId);
    return api.post('/documents_action', { action: 'get_contacts', contact_document_id: contactDocumentId })
      .then(response => {
        console.log('getContacts raw response:', response);
        return response;
      })
      .catch(error => {
        console.error('getContacts error:', error);
        console.error('getContacts error response:', error.response);
        throw error;
      });
  },
  sendDocuments: (contactDocumentId: number) =>
    api.post('/documents_action', { action: 'send_documents', contact_document_id: contactDocumentId }),
  uploadContacts: (formData: FormData) =>
    api.post('/documents_action?action=upload_contacts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  addManualContact: (data: { contact_document_id: number; name: string; phone_no: string; custom_fields?: string }) =>
    api.post('/documents_action', { action: 'add_manual_contact', ...data }),
  sendToContact: (contactId: number, contactDocumentId: number) =>
    api.post('/documents_action', { action: 'send_to_contact', contact_id: contactId, contact_document_id: contactDocumentId }),
  resendToContact: (contactId: number, contactDocumentId: number) =>
    api.post('/documents_action', { action: 'resend_to_contact', contact_id: contactId, contact_document_id: contactDocumentId }),
  sendReminders: (contactDocumentId: number) =>
    api.post('/documents_action', { action: 'send_reminders', contact_document_id: contactDocumentId }),
};

export const usersAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) =>
    api.get('/users', { params }),
  create: (data: { user_display: string; email: string; user_type_id: number; password?: string; is_active?: number }) =>
    api.post('/create_user', data),
  getUserTypes: () =>
    api.get('/user_types'),
};

export const auditAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string }) =>
    api.get('/audit', { params }),
};
