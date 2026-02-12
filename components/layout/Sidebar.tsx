'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  UserIcon,
  ClipboardDocumentListIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Certificates', href: '/certificates', icon: DocumentTextIcon },
  { name: 'Deceased', href: '/deceased', icon: UserGroupIcon },
  { name: 'Forms', href: '/documents', icon: DocumentIcon },
  { name: 'Users', href: '/users', icon: UserIcon },
  { name: 'Audit Trail', href: '/audit', icon: ClipboardDocumentListIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-dark-header min-h-screen fixed left-0 top-0">
      <div className="p-6">
        <div className="text-2xl font-heading font-bold text-white mb-1 tracking-wide">
          MB<span className="text-primary">OLA</span>
        </div>
        <div className="text-xs text-gray-400 leading-tight">
          Muslim Burial Organization<br />of Los Angeles
        </div>
      </div>

      <nav className="px-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-300 hover:bg-dark-bg hover:text-white'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
