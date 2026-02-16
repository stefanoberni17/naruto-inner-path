'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, MessageCircle, User } from 'lucide-react';

export default function BottomTabBar() {
  const pathname = usePathname();

  // Non mostrare tab bar su login/register
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  const tabs = [
    { href: '/', label: 'Percorso', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/chat', label: 'Maestro AI', icon: MessageCircle },
    { href: '/profilo', label: 'Profilo', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive
                    ? 'text-orange-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}