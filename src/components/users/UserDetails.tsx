'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import type { DirectoryUser } from './UserTable';

interface UserDetailsProps {
  user: DirectoryUser;
  onClose: () => void;
}

const fields: { key: keyof Pick<DirectoryUser, 'email' | 'phone' | 'joinedDate'>; label: string }[] = [
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'joinedDate', label: 'Joined' },
];

export default function UserDetails({ user, onClose }: UserDetailsProps) {
  return (
    <aside className="glass-card rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-gray-900">{user.name}</h2>
          <p className="mt-0.5 text-xs text-gray-500">User profile</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
          aria-label="Close user details"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      <span
        className={`mt-3 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
        }`}
      >
        {user.status}
      </span>

      <dl className="mt-3 divide-y divide-gray-100">
        {fields.map((field) => (
          <div key={field.key} className="py-2">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
              {field.label}
            </dt>
            <dd className="mt-0.5 break-words text-sm text-gray-900">{user[field.key]}</dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        className="mt-3 w-full rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
      >
        Deactivate user
      </button>
    </aside>
  );
}
