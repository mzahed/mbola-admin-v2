'use client';

import { useState } from 'react';
import { authAPI } from '@/lib/api';

export default function TestAPI() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await authAPI.test();
      setResult({ success: true, data: response });
    } catch (error: any) {
      setResult({ 
        success: false, 
        error: error.message,
        response: error.response,
        status: error.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg mb-4">
      <h3 className="font-semibold mb-2">API Connection Test</h3>
      <button
        onClick={testAPI}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API Connection'}
      </button>
      {result && (
        <pre className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
