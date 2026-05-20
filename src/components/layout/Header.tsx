'use client';

import { useState } from 'react';
import { BellIcon, ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const TABS = ['Overview', 'Analytics', 'Reports'] as const;
type Tab = (typeof TABS)[number];

export default function Header() {
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-white px-3 sm:h-16 sm:px-6 lg:px-8">
      {/* Mobile: tab dropdown */}
      <div className="relative min-w-0 md:hidden">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as Tab)}
          className="w-full min-w-[8.5rem] appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm font-medium text-gray-900"
          aria-label="Section"
        >
          {TABS.map((tab) => (
            <option key={tab} value={tab}>
              {tab}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
          aria-hidden
        />
      </div>

      {/* Desktop: tab buttons */}
      <div className="hidden gap-2 md:flex">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              activeTab === tab
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
          aria-label="Notifications"
        >
          <BellIcon className="h-6 w-6" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((open) => !open)}
            className="flex items-center gap-2 rounded-full p-1.5 hover:bg-gray-100"
            aria-expanded={isProfileOpen}
            aria-haspopup="menu"
          >
            <UserCircleIcon className="h-8 w-8 text-gray-600" />
            <span className="hidden text-sm font-medium text-gray-700 sm:inline">Admin User</span>
          </button>

          {isProfileOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40"
                aria-label="Close menu"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-1 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Your Profile
                </Link>
                <Link
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
