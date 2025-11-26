'use client';
import { useState, useEffect } from 'react';
import { UserCircleIcon, HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { buildApiUrl } from '@/config';
import axiosClient from '../../../AxiosClient';

export default function ProfilePage() {
  // User info state
  const [user, setUser] = useState<{ email: string; phone_number: string }>({
    email: '',
    phone_number: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Create superuser modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    email: '',
    password: '',
    phone_number: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Fetch user details on mount
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const url = buildApiUrl('/v1/superuser/me/get');
        const response = await axiosClient.get(url);
        const data = response.data;
        setUser({
          email: data.email || '',
          phone_number: data.phone_number || '',
        });
      } catch (err) {
        setError('Could not load user details');
        console.log(err, "err")
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Create superuser handler
  const handleCreateSuperuser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      const url = buildApiUrl('/v1/superuser/me/create');
      const response = await axiosClient.post(url, createData);
      if (response.data) {
        setCreateSuccess('Superuser created successfully!');
        setCreateData({ email: '', password: '', phone_number: '' });
      }
    } catch (err: any) {
      const data = err.response?.data;
      if (typeof data?.detail === 'string') {
        setCreateError(data.detail);
      } else if (Array.isArray(data?.detail)) {
        setCreateError(
          data.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ')
        );
      } else if (typeof data?.detail === 'object' && data?.detail !== null) {
        setCreateError(JSON.stringify(data.detail));
      } else {
        setCreateError('Failed to create superuser');
      }
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pattern relative">
      {/* Back to Dashboard */}
      <Link
        href="/dashboard"
        className="fixed top-8 left-8 flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
        title="Back to Dashboard"
      >
        <HomeIcon className="w-6 h-6 text-[#5F22D9]" />
      </Link>

      <div className="max-w-2xl mx-auto pt-16 px-4">
        {/* User Details Card */}
        <div className="glass-card rounded-2xl p-8 mb-8 flex flex-col items-center">
          <div className="w-28 h-28 bg-[#5F22D9]/10 rounded-full flex items-center justify-center mb-4">
            <UserCircleIcon className="w-20 h-20 text-[#5F22D9]" />
          </div>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900">{user.email}</h1>
              <p className="text-gray-500">Phone: {user.phone_number}</p>
            </>
          )}
        </div>

        {/* Add New Superuser Button */}
        <div className="flex justify-end mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2 bg-[#5F22D9] text-white rounded-lg text-sm font-medium hover:bg-[#5F22D9]/90 transition-colors"
          >
            Add New Superuser
          </button>
        </div>

        {/* Create Superuser Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
              <h2 className="text-lg font-semibold mb-4">Create New Superuser</h2>
              <form onSubmit={handleCreateSuperuser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={createData.email}
                    onChange={e => setCreateData({ ...createData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={createData.password}
                    onChange={e => setCreateData({ ...createData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={createData.phone_number}
                    onChange={e => setCreateData({ ...createData, phone_number: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                {createError && <div className="text-red-500 text-sm">{createError}</div>}
                {createSuccess && <div className="text-green-600 text-sm">{createSuccess}</div>}
                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full py-2 bg-[#5F22D9] text-white rounded hover:bg-[#5F22D9]/90 transition"
                >
                  {createLoading ? 'Creating...' : 'Create Superuser'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
