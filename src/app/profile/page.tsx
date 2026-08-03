'use client';
import { useState, useEffect, type ReactNode, type FormEvent } from 'react';
import {
  UserCircleIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { buildApiUrl } from '@/config';
import axiosClient from '../../../AxiosClient';
import Can from '@/components/common/Can';
import PermissionList from '@/components/common/PermissionList';
import PermissionPicker from '@/components/common/PermissionPicker';
import { hasPermission, normalizePermissionsForPicker } from '@/utils/permissions';
import { getApiErrorDetail } from '@/utils/apiError';

interface SuperUserProfile {
  id: string;
  email: string;
  phone_number: string;
  username: string;
  team: string;
  permissions: string[];
  is_active: boolean;
}

interface SuperUserSearchResult extends SuperUserProfile {}

const TEAMS = [
  'OPERATIONS',
  'ENGINEERING',
  'MARKETING',
  'CUSTOMER_SUPPORT',
  'EXPANSION',
  'DATA_SCIENCE',
  'HR',
  'FINANCE',
] as const;

const EMPTY_USER: SuperUserProfile = {
  id: '',
  email: '',
  phone_number: '',
  username: '',
  team: '',
  permissions: [],
  is_active: false,
};

function formatTeam(team: string): string {
  if (!team) return '—';
  return team
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function mapProfile(data: Record<string, unknown>): SuperUserProfile {
  return {
    id: String(data.id || ''),
    email: String(data.email || ''),
    phone_number: String(data.phone_number || ''),
    username: String(data.username || ''),
    team: String(data.team || ''),
    permissions: Array.isArray(data.permissions) ? (data.permissions as string[]) : [],
    is_active: Boolean(data.is_active),
  };
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900 break-all">{value || '—'}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<SuperUserProfile>(EMPTY_USER);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createData, setCreateData] = useState({
    email: '',
    password: '',
    phone_number: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');

  // Privilege management (admin:* or *)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SuperUserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selected, setSelected] = useState<SuperUserSearchResult | null>(null);
  const [editTeam, setEditTeam] = useState('');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const canManageAdmins =
    hasPermission(user.permissions, '*') || hasPermission(user.permissions, 'admin:*');

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const url = buildApiUrl('/v1/superuser/me/get');
        const response = await axiosClient.get(url);
        setUser(mapProfile(response.data || {}));
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
        setCreateData({ email: '', password: '', phone_number: '' });
      }
    } catch (err: unknown) {
      setCreateError(getApiErrorDetail(err, 'Failed to create superuser'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;

    setSearchLoading(true);
    setSearchError('');
    setSaveSuccess('');
    setSelected(null);
    try {
      const url = buildApiUrl(`/v1/superuser/me/search/${encodeURIComponent(q)}`);
      const response = await axiosClient.get(url, { params: { limit: 20 } });
      const results = Array.isArray(response.data) ? response.data.map(mapProfile) : [];
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('No superusers found');
      }
    } catch (err: unknown) {
      setSearchResults([]);
      setSearchError(getApiErrorDetail(err, 'Search failed'));
    } finally {
      setSearchLoading(false);
    }
  };

  const selectUser = (result: SuperUserSearchResult) => {
    setSelected(result);
    setEditTeam(result.team || '');
    setEditPermissions(normalizePermissionsForPicker(result.permissions || []));
    setSaveError('');
    setSaveSuccess('');
  };

  const handleSavePrivileges = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    const permissions = normalizePermissionsForPicker(editPermissions);

    setSaveLoading(true);
    setSaveError('');
    setSaveSuccess('');
    try {
      const url = buildApiUrl('/v1/superuser/me/privileges');
      const response = await axiosClient.patch(url, {
        superuser_id: selected.id,
        team: editTeam || null,
        permissions,
      });
      setSaveSuccess(response.data?.message || 'Privileges updated');
      const updated = {
        ...selected,
        team: response.data?.team || editTeam,
        permissions: response.data?.permissions || permissions,
      };
      setSelected(updated);
      setSearchResults((prev) =>
        prev.map((row) => (row.id === updated.id ? { ...row, ...updated } : row))
      );
    } catch (err: unknown) {
      setSaveError(getApiErrorDetail(err, 'Failed to update privileges'));
    } finally {
      setSaveLoading(false);
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
        {/* Profile */}
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

        {/* Admin actions */}
        <Can permissions={user.permissions} permission="*">
          <section className="rounded-2xl border border-gray-200/80 bg-white/95 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Admin tools</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Create accounts and manage access for the team
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

        {canManageAdmins && !loading && !error && (
          <section className="rounded-2xl border border-gray-200/80 bg-white/95 p-5 sm:p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Manage privileges</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Search by username or email, then update team and permissions
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search username or email"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5F22D9]/30 focus:border-[#5F22D9]"
                />
              </div>
              <button
                type="submit"
                disabled={searchLoading || !searchQuery.trim()}
                className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {searchLoading ? 'Searching…' : 'Search'}
              </button>
            </form>

            {searchError && (
              <p className="text-sm text-red-500">{searchError}</p>
            )}

            {searchResults.length > 0 && (
              <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
                {searchResults.map((result) => (
                  <li key={result.id}>
                    <button
                      type="button"
                      onClick={() => selectUser(result)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                        selected?.id === result.id ? 'bg-[#5F22D9]/5' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {result.username || result.email}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{result.email}</p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {formatTeam(result.team)}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {selected && (
              <form
                onSubmit={handleSavePrivileges}
                className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 sm:p-5 space-y-4"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selected.username || selected.email}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 break-all">{selected.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Team</label>
                  <select
                    value={editTeam}
                    onChange={(e) => setEditTeam(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5F22D9]/30 focus:border-[#5F22D9]"
                  >
                    <option value="">Select team</option>
                    {TEAMS.map((team) => (
                      <option key={team} value={team}>
                        {formatTeam(team)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <PermissionPicker
                    value={editPermissions}
                    onChange={setEditPermissions}
                  />
                </div>

                {saveError && <p className="text-sm text-red-500">{saveError}</p>}
                {saveSuccess && <p className="text-sm text-green-600">{saveSuccess}</p>}

                <Can
                  permissions={user.permissions}
                  permission="*"
                  fallback={
                    <p className="text-xs text-amber-600">
                      Updating privileges requires full admin permission (*). You can search with
                      admin:*.
                    </p>
                  }
                >
                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#5F22D9] text-white rounded-xl text-sm font-medium hover:bg-[#4f1cb8] disabled:opacity-50 transition-colors"
                  >
                    {saveLoading ? 'Saving…' : 'Save privileges'}
                  </button>
                </Can>
              </form>
            )}
          </section>
        )}
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
