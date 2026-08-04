'use client';
import { useState, useEffect, type ReactNode, type FormEvent } from 'react';
import {
  UserCircleIcon,
  HomeIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { buildApiUrl } from '@/config';
import axiosClient from '../../../AxiosClient';
import Can from '@/components/common/Can';
import PermissionList from '@/components/common/PermissionList';
import { getApiErrorDetail } from '@/utils/apiError';
import {
  EMPTY_SUPERUSER_PROFILE,
  formatTeam,
  mapSuperUserProfile,
  type SuperUserProfile,
} from '@/utils/superuserProfile';

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 break-all">{value || '—'}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<SuperUserProfile>(EMPTY_SUPERUSER_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    email: '',
    password: '',
    phone_number: '',
    username: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const url = buildApiUrl('/v1/superuser/me/get');
        const response = await axiosClient.get(url);
        setUser(mapSuperUserProfile(response.data || {}));
      } catch (err) {
        setError('Could not load user details');
        console.log(err, 'err');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleCreateSuperuser = async (e: FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess('');
    try {
      const url = buildApiUrl('/v1/superuser/me/create');
      const response = await axiosClient.post(url, createData);
      if (response.data) {
        setCreateSuccess('Superuser created successfully!');
        setCreateData({ email: '', password: '', phone_number: '', username: '' });
      }
    } catch (err: unknown) {
      setCreateError(getApiErrorDetail(err, 'Failed to create superuser'));
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#FAFAFB] relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 70% 40% at 50% -5%, rgba(95, 34, 217, 0.08), transparent 55%),
            linear-gradient(rgba(95, 34, 217, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(95, 34, 217, 0.025) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 28px 28px, 28px 28px',
        }}
      />

      <Link
        href="/dashboard"
        className="fixed top-6 left-6 z-20 flex items-center justify-center w-11 h-11 bg-white rounded-full border border-gray-200/80 shadow-sm hover:shadow-md transition-all"
        title="Back to Dashboard"
      >
        <HomeIcon className="w-5 h-5 text-[#5F22D9]" />
      </Link>

      <div className="relative z-10 max-w-3xl mx-auto pt-16 sm:pt-20 px-4 sm:px-6 pb-16 space-y-6">
        <section className="rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-sm shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.05)] overflow-hidden">
          <div className="px-6 sm:px-8 py-6 sm:py-8 border-b border-gray-100 bg-gradient-to-b from-[#5F22D9]/[0.04] to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-20 h-20 shrink-0 bg-[#5F22D9]/10 rounded-2xl flex items-center justify-center">
                <UserCircleIcon className="w-12 h-12 text-[#5F22D9]" />
              </div>
              <div className="min-w-0 flex-1">
                {loading ? (
                  <p className="text-gray-400 text-sm">Loading profile…</p>
                ) : error ? (
                  <p className="text-red-500 text-sm">{error}</p>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight truncate">
                        {user.username || user.email || 'Superuser'}
                      </h1>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          user.is_active
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    {user.team && (
                      <p className="text-xs text-[#5F22D9] font-medium mt-1.5">
                        {formatTeam(user.team)}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {!loading && !error && (
            <div className="px-6 sm:px-8 py-2">
              <dl>
                <DetailRow label="ID" value={user.id} />
                <DetailRow label="Email" value={user.email} />
                <DetailRow label="Username" value={user.username} />
                <DetailRow label="Phone" value={user.phone_number} />
                <DetailRow label="Team" value={formatTeam(user.team)} />
              </dl>

              <Can permissions={user.permissions} permission="*">
                <div className="py-5 border-t border-gray-100 mt-1">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheckIcon className="w-4 h-4 text-[#5F22D9]" />
                    <p className="text-sm font-medium text-gray-700">Permissions</p>
                  </div>
                  <PermissionList permissions={user.permissions} />
                </div>
              </Can>
            </div>
          )}
        </section>

        <Can permissions={user.permissions} permission="*">
          <section className="rounded-2xl border border-gray-200/80 bg-white/95 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Admin tools</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Create accounts for the team
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setCreateError('');
                  setCreateSuccess('');
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#5F22D9] text-white rounded-xl text-sm font-medium hover:bg-[#4f1cb8] transition-colors"
              >
                <UserPlusIcon className="w-4 h-4" />
                Add superuser
              </button>
            </div>
          </section>
        </Can>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none"
              onClick={() => setShowCreateModal(false)}
              type="button"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Create superuser</h2>
            <p className="text-sm text-gray-500 mb-5">
              New accounts start inactive with no permissions until you assign them.
            </p>
            <form onSubmit={handleCreateSuperuser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={createData.username}
                  onChange={(e) => setCreateData({ ...createData, username: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5F22D9]/30 focus:border-[#5F22D9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={createData.email}
                  onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5F22D9]/30 focus:border-[#5F22D9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={createData.password}
                  onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5F22D9]/30 focus:border-[#5F22D9]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                <input
                  type="text"
                  required
                  value={createData.phone_number}
                  onChange={(e) =>
                    setCreateData({ ...createData, phone_number: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5F22D9]/30 focus:border-[#5F22D9]"
                />
              </div>
              {createError && <p className="text-sm text-red-500">{createError}</p>}
              {createSuccess && <p className="text-sm text-green-600">{createSuccess}</p>}
              <button
                type="submit"
                disabled={createLoading}
                className="w-full py-2.5 bg-[#5F22D9] text-white rounded-xl text-sm font-medium hover:bg-[#4f1cb8] disabled:opacity-50 transition-colors"
              >
                {createLoading ? 'Creating…' : 'Create superuser'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
