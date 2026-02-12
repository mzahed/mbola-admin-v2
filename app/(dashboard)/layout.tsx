'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, setUser, isAuthenticated, logout: logoutStore } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Only run once on mount
    let isMounted = true;
    let hasRun = false;
    
    // Always refresh user data from server on mount to ensure we have the latest user info
    // This prevents stale localStorage data from showing incorrect user information
    const checkAuth = async () => {
      // Prevent multiple simultaneous calls
      if (hasRun) return;
      hasRun = true;
      
      // Get current user state at the time of check
      const currentUser = useAuthStore.getState().user;
      const currentIsAuthenticated = useAuthStore.getState().isAuthenticated;
      
      // If we have a user in localStorage, allow them to proceed while we verify
      if (currentUser && currentIsAuthenticated) {
        setIsCheckingAuth(false);
      }
      
      try {
        const response = await authAPI.getMe();
        
        if (!isMounted) return;
        
        if (response.success && response.user) {
          setUser(response.user);
          setIsCheckingAuth(false);
        } else {
          const latestUser = useAuthStore.getState().user;
          const latestIsAuthenticated = useAuthStore.getState().isAuthenticated;
          if (!latestUser || !latestIsAuthenticated) {
            setIsCheckingAuth(false);
            logoutStore();
            router.push('/login');
          } else {
            setIsCheckingAuth(false);
          }
        }
      } catch (error: any) {
        if (!isMounted) return;
        
        if (error?.response?.status === 401) {
          const latestUser = useAuthStore.getState().user;
          const latestIsAuthenticated = useAuthStore.getState().isAuthenticated;
          if (!latestUser || !latestIsAuthenticated) {
            setIsCheckingAuth(false);
            logoutStore();
            router.push('/login');
          } else {
            setIsCheckingAuth(false);
          }
        } else if (error?.isNetworkError) {
          const latestUser = useAuthStore.getState().user;
          const latestIsAuthenticated = useAuthStore.getState().isAuthenticated;
          if (latestUser && latestIsAuthenticated) {
            setIsCheckingAuth(false);
          } else {
            setIsCheckingAuth(false);
            logoutStore();
            router.push('/login');
          }
        } else {
          setIsCheckingAuth(false);
        }
      }
    };

    // Small delay to allow session cookie to be set after login redirect
    const timeoutId = setTimeout(() => {
      checkAuth();
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array - only run once on mount

  if (isCheckingAuth || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg-light">
      <Sidebar />
      <main className="flex-1 ml-64">
        {children}
      </main>
    </div>
  );
}
