'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import TestAPI from './test-api';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Page loaded - minimal logging
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response: any = await authAPI.login(email, password);
      
      if (response && response.success) {
        setUser(response.user);
        router.push('/dashboard');
      } else {
        setError(response?.message || 'Login failed');
      }
    } catch (err: any) {
      // Handle different error formats
      let errorMessage = 'An error occurred. Please try again.';
      
      if (err.response) {
        // Server responded with error
        errorMessage = err.response.data?.message 
          || err.response.data?.error
          || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Request made but no response (network/CORS error)
        errorMessage = 'Network error: Could not connect to server. Please check your connection or try again.';
      } else {
        // Something else
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-bg to-dark-header">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-logo text-primary">
              mbo<span className="text-dark-header">la</span>
            </h1>
            <p className="text-text-light mt-2">Muslim Burial Organization of Los Angeles</p>
            <p className="text-sm text-text-light mt-1">Admin Panel</p>
          </div>

          {/* API Test (for debugging) */}
          {process.env.NODE_ENV === 'development' && <TestAPI />}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-dark mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-dark mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-text-light">
            <p>© {new Date().getFullYear()} MBOLA. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
