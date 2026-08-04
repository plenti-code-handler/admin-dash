'use client';
import { useState, type FormEvent } from 'react';
import { HomeIcon, MagnifyingGlassIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { buildApiUrl } from '@/config';
import axiosClient from '../../../AxiosClient';
import Can from '@/components/common/Can';
import PermissionPicker from '@/components/common/PermissionPicker';
import { normalizePermissionsForPicker } from '@/utils/permissions';
import { getApiErrorDetail } from '@/utils/apiError';
import { useMyPermissions } from '@/hooks/useMyPermissions';
import {
  SUPERUSER_TEAMS,
  formatTeam,
  mapSuperUserProfile,
  type SuperUserProfile,
} from '@/utils/superuserProfile';

export default function ManagePermissionsPage() {
  const { permissions: myPermissions, loading: myPermissionsLoading } = useMyPermissions();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SuperUserProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selected, setSelected] = useState<SuperUserProfile | null>(null);
  const [editTeam, setEditTeam] = useState('');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

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
      const results = Array.isArray(response.data)
        ? response.data.map((row: Record<string, unknown>) => mapSuperUserProfile(row))
        : [];
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

  const selectUser = (result: SuperUserProfile) => {
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
      const updated: SuperUserProfile = {
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

      <div className="relative z-10 max-w-3xl mx-auto pt-16 sm:pt-20 px-4 sm:px-6 pb-16">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Manage permissions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Search superusers and update their team and access
          </p>
        </div>

        {myPermissionsLoading ? (
          <div className="rounded-2xl border border-gray-200/80 bg-white p-8 text-sm text-gray-400">
            Loading…
          </div>
        ) : (
          <Can
            permissions={myPermissions}
            permission="*"
            fallback={
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <ShieldExclamationIcon className="w-6 h-6 text-amber-600 shrink-0" />
                  <div>
                    <h2 className="text-base font-semibold text-amber-900">Access restricted</h2>
                    <p className="text-sm text-amber-800 mt-1">
                      Managing permissions requires full admin access (*). Contact a platform admin
                      if you need this capability.
                    </p>
                  </div>
                </div>
              </div>
            }
          >
            <section className="rounded-2xl border border-gray-200/80 bg-white/95 p-5 sm:p-6 shadow-sm space-y-5">
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

              {searchError && <p className="text-sm text-red-500">{searchError}</p>}

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
                      {SUPERUSER_TEAMS.map((team) => (
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
                    <PermissionPicker value={editPermissions} onChange={setEditPermissions} />
                  </div>

                  {saveError && <p className="text-sm text-red-500">{saveError}</p>}
                  {saveSuccess && <p className="text-sm text-green-600">{saveSuccess}</p>}

                  <button
                    type="submit"
                    disabled={saveLoading}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#5F22D9] text-white rounded-xl text-sm font-medium hover:bg-[#4f1cb8] disabled:opacity-50 transition-colors"
                  >
                    {saveLoading ? 'Saving…' : 'Save privileges'}
                  </button>
                </form>
              )}
            </section>
          </Can>
        )}
      </div>
    </div>
  );
}
