'use client';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface UserDetailsProps {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    status: string;
    joinedDate: string;
  };
  onClose: () => void;
}

export default function UserDetails({ user, onClose }: UserDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">User Details</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">Name</label>
          <p className="mt-1 text-sm text-gray-900">{user.name}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Email</label>
          <p className="mt-1 text-sm text-gray-900">{user.email}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Phone</label>
          <p className="mt-1 text-sm text-gray-900">{user.phone}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Status</label>
          <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {user.status}
          </span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500">Joined Date</label>
          <p className="mt-1 text-sm text-gray-900">{user.joinedDate}</p>
        </div>
      </div>

      <div className="pt-4 border-t">
        <button
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Deactivate User
        </button>
      </div>
    </div>
  );
}