'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { dashboardAPI } from '@/lib/api';
import { 
  UserGroupIcon, 
  DocumentTextIcon,
  CalendarIcon 
} from '@heroicons/react/24/outline';

interface DashboardStats {
  total_burial_wadi_us_salam: number;
  total_burial_wadi_e_hussain: number;
  total_current_year: number;
  total_burials: number;
}

interface RecentDeceased {
  id: number;
  full_name: string;
  date_of_death: string;
  date_of_burial: string;
  cemetery: string;
  certificate_code: string;
  status: string;
}

interface RecentCertificate {
  id: number;
  code: string;
  issue_date: string;
  issue_to: string;
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery<{ 
    success: boolean; 
    stats: DashboardStats;
    recent_deceased: RecentDeceased[];
    recent_certificates: RecentCertificate[];
  }>({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardAPI.getStats() as Promise<any>,
    refetchOnWindowFocus: false,
  });

  const stats = data?.stats;
  const recentDeceased = data?.recent_deceased || [];
  const recentCertificates = data?.recent_certificates || [];

  const statCards = [
    {
      name: 'Total Burials at Wadi-e-Hussain',
      value: stats?.total_burial_wadi_e_hussain || 0,
      icon: UserGroupIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Burials at Wadi-us-Salam',
      value: stats?.total_burial_wadi_us_salam || 0,
      icon: UserGroupIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Burials',
      value: stats?.total_burials || 0,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Burials This Year',
      value: stats?.total_current_year || 0,
      icon: CalendarIcon,
      color: 'bg-primary',
    },
  ];

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p>Error loading dashboard data</p>
            <p className="text-xs mt-2">{String(error)}</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat) => (
                <div
                  key={stat.name}
                  className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-text-light mb-1">
                        {stat.name}
                      </p>
                      <p className="text-3xl font-bold text-text-dark">
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Deceased and Certificates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Deceased */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-dark">
                    Recent Deceased
                  </h2>
                  <button
                    onClick={() => router.push('/deceased')}
                    className="text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    View All
                  </button>
                </div>
                {recentDeceased.length === 0 ? (
                  <p className="text-text-light text-sm">No deceased records found</p>
                ) : (
                  <div className="space-y-3">
                    {recentDeceased.map((deceased) => (
                      <div
                        key={deceased.id}
                        onClick={() => router.push(`/deceased/${deceased.id}`)}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-dark truncate">
                            {deceased.full_name || 'Unknown'}
                          </p>
                          <p className="text-sm text-text-light">
                            {deceased.date_of_death || 'No date'}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              deceased.status === 'Buried'
                                ? 'bg-green-100 text-green-800'
                                : deceased.status === 'Scheduled'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {deceased.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Certificates */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-dark">
                    Recent Certificates
                  </h2>
                  <button
                    onClick={() => router.push('/certificates')}
                    className="text-sm text-primary hover:text-primary-dark font-medium"
                  >
                    View All
                  </button>
                </div>
                {recentCertificates.length === 0 ? (
                  <p className="text-text-light text-sm">No certificates found</p>
                ) : (
                  <div className="space-y-3">
                    {recentCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        onClick={() => router.push('/certificates')}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-text-dark truncate">
                            {cert.code}
                          </p>
                          <p className="text-sm text-text-light truncate">
                            {cert.issue_to}
                          </p>
                          <p className="text-xs text-text-light mt-1">
                            {cert.issue_date || 'No date'}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              cert.status === 'Signed'
                                ? 'bg-green-100 text-green-800'
                                : cert.status === 'Active'
                                ? 'bg-blue-100 text-blue-800'
                                : cert.status === 'Expired'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {cert.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
