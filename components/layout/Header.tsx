'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

export default function Header({ title }: { title: string }) {
  const router = useRouter();
  const { user, logout: logoutStore } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      logoutStore();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally
      logoutStore();
      router.push('/login');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-heading font-semibold text-text-dark">
          {title}
        </h1>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="text-right">
                <div className="text-sm font-medium text-text-dark">
                  {user.user_display || user.email || 'User'}
                </div>
                <div className="text-xs text-text-light">
                  {user.user_type_display || ''}
                </div>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                {(user.user_display || user.email || 'U').charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-text-light hover:text-text-dark transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
