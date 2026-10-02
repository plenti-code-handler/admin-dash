'use client';

import { useState } from 'react';
import UserDetails from '@/components/users/UserDetails';
import UserTable, { type DirectoryUser } from '@/components/users/UserTable';

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<DirectoryUser | null>(null);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <header>
        <h1 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">Users</h1>
        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
          Browse accounts and open a profile.
        </p>
      </header>

      <div
        className={
          selectedUser
            ? 'grid items-start gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]'
            : ''
        }
      >
        <UserTable selectedId={selectedUser?.id ?? null} onUserSelect={setSelectedUser} />
        {selectedUser && (
          <div className="order-first xl:order-none">
            <UserDetails user={selectedUser} onClose={() => setSelectedUser(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
