'use client';
import { useState } from 'react';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { logout } = useAuth();

  const handleSignOut = () => {
    setIsProfileOpen(false);
    logout(); // This will clear tokens and redirect to login
  };

  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-8">
      {/* Left side - Tabs */}
      <div className="flex space-x-6">
        <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
          Overview
        </button>
        <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
          Analytics
        </button>
        <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
          Reports
        </button>
      </div>

      {/* Right side - Profile & Notifications */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
          <BellIcon className="h-6 w-6" />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-3 p-2 rounded-full hover:bg-gray-100"
          >
            <UserCircleIcon className="h-8 w-8 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Admin User</span>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
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
              >
                Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
