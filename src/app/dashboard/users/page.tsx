'use client';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import UserTable from '@/components/users/UserTable';
import UserDetails from '@/components/users/UserDetails';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-xl p-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">

          {/* Users Table */}
          <div className="glass-card rounded-xl p-6">
            <UserTable onUserSelect={setSelectedUser} searchQuery={searchQuery} />
          </div>
        </div>

        {/* User Details Sidebar */}
        {selectedUser && (
          <div className="w-96">
            <div className="glass-card rounded-xl p-6 sticky top-6">
              <UserDetails user={selectedUser} onClose={() => setSelectedUser(null)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}