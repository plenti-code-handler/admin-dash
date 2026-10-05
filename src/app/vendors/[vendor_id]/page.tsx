'use client';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/services/api';
import { logger } from '@/utils/logger';
import { buildApiUrl } from '@/config';
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import Sidebar, { SidebarMenuButton, SidebarProvider } from '@/components/layout/Sidebar';
import ToastNotice, { type ToastState } from '@/components/common/ToastNotice';
import { useMyPermissions } from '@/hooks/useMyPermissions';
import { getApiErrorDetail } from '@/utils/apiError';
import { hasPermission } from '@/utils/permissions';
import axiosClient from '../../../../AxiosClient';

interface VendorDetails {
  vendor_id: string;
  vendor_name: string;
  email: string;
  phone_number: string;
  vendor_type: string;
  gst_number: string | null;
  fssai_number: string | null;
  pan_number: string | null;
  address_url: string;
  address: string;
  is_active: boolean;
  is_online: boolean;
  account_approved: boolean;
  mou_signed: boolean;
  created_at: number;
  logo_url: string | null;
  backcover_url: string | null;
  account_manager: string | null;
  account_manager_id: string | null;
}

interface AccountManagerOption {
  id: string;
  name: string | null;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="glass-card rounded-xl p-4 sm:p-6">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-1 block text-sm font-medium text-gray-700">{label}</p>
      <div className="text-sm text-gray-900">{children}</div>
    </div>
  );
}

function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: 'green' | 'blue' | 'orange' | 'gray';
}) {
  const toneClass = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    orange: 'bg-orange-100 text-orange-800',
    gray: 'bg-gray-100 text-gray-800',
  }[tone];

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${toneClass}`}>
      {label}
    </span>
  );
}

function CopyButton({
  copied,
  label,
  onClick,
}: {
  copied: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
    >
      {copied ? (
        <CheckIcon className="h-4 w-4 text-green-600" />
      ) : (
        <ClipboardDocumentIcon className="h-4 w-4" />
      )}
    </button>
  );
}

export default function VendorDetailsPage() {
  const params = useParams();
  const vendor_id = Array.isArray(params.vendor_id) ? params.vendor_id[0] : params.vendor_id;
  const router = useRouter();
  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [approving, setApproving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const [managers, setManagers] = useState<AccountManagerOption[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [savingManager, setSavingManager] = useState(false);
  const { permissions } = useMyPermissions();
  const canAssign = hasPermission(permissions, 'vendors:assign');

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get<VendorDetails>(`/v1/superuser/vendor/get/${vendor_id}`);
        setVendor(data);
        setLogoFailed(false);
      } catch (err) {
        logger.error('Error fetching vendor details:', err);
        setError('Failed to load vendor details');
      } finally {
        setLoading(false);
      }
    };
    if (vendor_id) fetchVendor();
  }, [vendor_id, refreshKey]);

  useEffect(() => {
    setSelectedManagerId(vendor?.account_manager_id || '');
  }, [vendor?.account_manager_id]);

  useEffect(() => {
    if (!canAssign) return;
    let cancelled = false;
    const loadManagers = async () => {
      try {
        const response = await axiosClient.get(buildApiUrl('/v1/superuser/vendor/account-managers'));
        if (!cancelled) {
          setManagers(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        logger.error('Error loading account managers:', err);
      }
    };
    loadManagers();
    return () => {
      cancelled = true;
    };
  }, [canAssign]);

  const handleApproveVendor = async () => {
    if (!vendor) return;

    try {
      setApproving(true);
      const url = buildApiUrl('/v1/superuser/vendor/account/true', {
        vendor_id: vendor_id as string,
      });
      await axiosClient.patch(url);
      setRefreshKey((k) => k + 1);
      setToast({ message: 'Vendor approved', variant: 'success' });
    } catch (err) {
      logger.error('Error approving vendor:', err);
      setToast({ message: 'Failed to approve vendor', variant: 'error' });
    } finally {
      setApproving(false);
    }
  };

  const handleDeactivateVendor = async () => {
    if (!vendor) return;
    if (!confirm('Deactivate this vendor? They will need to be approved again to regain access.')) {
      return;
    }

    try {
      setDeactivating(true);
      const url = buildApiUrl('/v1/superuser/vendor/account/false', {
        vendor_id: vendor_id as string,
      });
      await axiosClient.patch(url);
      setRefreshKey((k) => k + 1);
      setToast({ message: 'Vendor deactivated', variant: 'success' });
    } catch (err) {
      logger.error('Error deactivating vendor:', err);
      setToast({ message: 'Failed to deactivate vendor', variant: 'error' });
    } finally {
      setDeactivating(false);
    }
  };

  const saveAccountManager = async (accountManagerId: string | null) => {
    try {
      setSavingManager(true);
      const response = await axiosClient.patch(buildApiUrl('/v1/superuser/vendor/account-manager'), {
        vendor_id,
        account_manager_id: accountManagerId,
      });
      setRefreshKey((k) => k + 1);
      setToast({
        message: response.data?.message || (accountManagerId ? 'Account manager assigned' : 'Account manager removed'),
        variant: 'success',
      });
    } catch (err) {
      logger.error('Error updating account manager:', err);
      setToast({ message: getApiErrorDetail(err, 'Failed to update account manager'), variant: 'error' });
    } finally {
      setSavingManager(false);
    }
  };

  const handleAssignManager = () => {
    if (!selectedManagerId || selectedManagerId === vendor?.account_manager_id) return;
    saveAccountManager(selectedManagerId);
  };

  const handleRemoveManager = () => {
    if (!vendor?.account_manager_id) return;
    if (!confirm('Remove the account manager from this vendor?')) return;
    saveAccountManager(null);
  };

  const copyValue = async (value: string, key: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((current) => (current === key ? null : current)), 1500);
      setToast({ message: `${label} copied`, variant: 'success' });
    } catch (err) {
      logger.error('Error copying value:', err);
      setToast({ message: `Could not copy ${label.toLowerCase()}`, variant: 'error' });
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const typeClass =
    vendor?.vendor_type === 'RESTAURANT'
      ? 'bg-red-100 text-red-800'
      : vendor?.vendor_type === 'BAKERY'
        ? 'bg-amber-100 text-amber-800'
        : vendor?.vendor_type === 'SUPERMARKET'
          ? 'bg-emerald-100 text-emerald-800'
          : 'bg-gray-100 text-gray-800';

  return (
    <SidebarProvider>
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex h-14 items-center border-b border-gray-200 bg-white px-3 lg:hidden">
          <SidebarMenuButton />
        </div>
        <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
            </div>
          ) : error || !vendor ? (
            <div className="glass-card rounded-xl p-6">
              <div className="py-12 text-center">
                <h3 className="mb-2 text-sm font-medium text-gray-900">Error</h3>
                <p className="mb-4 text-sm text-gray-500">{error || 'Vendor not found'}</p>
                <button
                  onClick={() => router.push('/dashboard/vendors')}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back to Vendors
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="glass-card rounded-xl p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => router.back()}
                    className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
                  >
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    Back
                  </button>
                  {!vendor.account_approved ? (
                    <button
                      onClick={handleApproveVendor}
                      disabled={approving}
                      className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {approving ? 'Approving...' : 'Approve'}
                    </button>
                  ) : (
                    <button
                      onClick={handleDeactivateVendor}
                      disabled={deactivating}
                      className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      {deactivating ? 'Deactivating...' : 'Deactivate'}
                    </button>
                  )}
                </div>

                <div className="mt-5 flex items-start gap-4">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    {vendor.logo_url && !logoFailed ? (
                      <img
                        src={vendor.logo_url}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={() => setLogoFailed(true)}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-indigo-600">
                        {vendor.vendor_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-xl font-semibold text-gray-900">{vendor.vendor_name}</h1>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${typeClass}`}
                    >
                      {vendor.vendor_type}
                    </span>
                  </div>
                </div>
              </div>

              <Section title="Status">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                  <Field label="Account">
                    <StatusBadge
                      label={vendor.account_approved ? 'Approved' : 'Pending'}
                      tone={vendor.account_approved ? 'blue' : 'orange'}
                    />
                  </Field>
                  <Field label="MOU">
                    <StatusBadge
                      label={vendor.mou_signed ? 'Signed' : 'Not signed'}
                      tone={vendor.mou_signed ? 'green' : 'gray'}
                    />
                  </Field>
                  <Field label="Dashboard">
                    <StatusBadge
                      label={vendor.is_active ? 'Active' : 'Inactive'}
                      tone={vendor.is_active ? 'green' : 'gray'}
                    />
                  </Field>
                  <Field label="Availability">
                    <StatusBadge
                      label={vendor.is_online ? 'Online' : 'Offline'}
                      tone={vendor.is_online ? 'blue' : 'gray'}
                    />
                  </Field>
                </div>
              </Section>

              <Section title="Contact">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Field label="Email">
                    <div className="flex items-center gap-2">
                      <a href={`mailto:${vendor.email}`} className="break-all text-indigo-600 hover:underline">
                        {vendor.email}
                      </a>
                      <CopyButton
                        copied={copied === 'email'}
                        label="Copy email"
                        onClick={() => copyValue(vendor.email, 'email', 'Email')}
                      />
                    </div>
                  </Field>
                  <Field label="Phone number">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${vendor.phone_number.replace(/\s/g, '')}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {vendor.phone_number}
                      </a>
                      <CopyButton
                        copied={copied === 'phone'}
                        label="Copy phone number"
                        onClick={() => copyValue(vendor.phone_number, 'phone', 'Phone number')}
                      />
                    </div>
                  </Field>
                </div>
              </Section>

              <Section title="Business">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <CopyableField
                    label="GST number"
                    value={vendor.gst_number}
                    copied={copied === 'gst'}
                    onCopy={() => vendor.gst_number && copyValue(vendor.gst_number, 'gst', 'GST number')}
                  />
                  <CopyableField
                    label="FSSAI number"
                    value={vendor.fssai_number}
                    copied={copied === 'fssai'}
                    onCopy={() =>
                      vendor.fssai_number && copyValue(vendor.fssai_number, 'fssai', 'FSSAI number')
                    }
                  />
                  <CopyableField
                    label="PAN number"
                    value={vendor.pan_number}
                    copied={copied === 'pan'}
                    onCopy={() => vendor.pan_number && copyValue(vendor.pan_number, 'pan', 'PAN number')}
                  />
                  <Field label="Vendor ID">
                    <div className="flex items-start gap-2">
                      <p className="break-all font-mono text-xs sm:text-sm">{vendor.vendor_id}</p>
                      <CopyButton
                        copied={copied === 'id'}
                        label="Copy vendor ID"
                        onClick={() => copyValue(vendor.vendor_id, 'id', 'Vendor ID')}
                      />
                    </div>
                  </Field>
                  <Field label="Created">{formatDate(vendor.created_at)}</Field>
                  <Field label="Account manager">
                    {canAssign ? (
                      <AccountManagerControl
                        vendor={vendor}
                        managers={managers}
                        selectedManagerId={selectedManagerId}
                        saving={savingManager}
                        onSelect={setSelectedManagerId}
                        onAssign={handleAssignManager}
                        onRemove={handleRemoveManager}
                      />
                    ) : (
                      vendor.account_manager || '—'
                    )}
                  </Field>
                </div>
              </Section>

              <Section title="Location">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Field label="Address">
                    <div className="flex items-start gap-2">
                      <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                      <p className="break-words">{vendor.address || '—'}</p>
                    </div>
                  </Field>
                  <Field label="Map">
                    {vendor.address_url ? (
                      <a
                        href={vendor.address_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        Open in maps
                        <ArrowTopRightOnSquareIcon className="ml-1.5 h-4 w-4" />
                      </a>
                    ) : (
                      '—'
                    )}
                  </Field>
                </div>
                {vendor.backcover_url && (
                  <div className="mt-6">
                    <p className="mb-2 text-sm font-medium text-gray-700">Cover</p>
                    <img
                      src={vendor.backcover_url}
                      alt=""
                      className="h-32 w-full rounded-lg border border-gray-200 object-cover sm:h-40"
                    />
                  </div>
                )}
              </Section>
            </>
          )}
        </div>
      </div>
      <ToastNotice toast={toast} onDismiss={dismissToast} />
    </div>
    </SidebarProvider>
  );
}

function AccountManagerControl({
  vendor,
  managers,
  selectedManagerId,
  saving,
  onSelect,
  onAssign,
  onRemove,
}: {
  vendor: VendorDetails;
  managers: AccountManagerOption[];
  selectedManagerId: string;
  saving: boolean;
  onSelect: (id: string) => void;
  onAssign: () => void;
  onRemove: () => void;
}) {
  const options = [...managers];
  if (vendor.account_manager_id && !options.some((manager) => manager.id === vendor.account_manager_id)) {
    options.unshift({
      id: vendor.account_manager_id,
      name: vendor.account_manager,
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={selectedManagerId}
        onChange={(event) => onSelect(event.target.value)}
        disabled={saving}
        aria-label="Account manager"
        className="min-w-[12rem] flex-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 disabled:opacity-50"
      >
        <option value="">Select a manager</option>
        {options.map((manager) => (
          <option key={manager.id} value={manager.id}>
            {manager.name || manager.id}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={onAssign}
        disabled={saving || !selectedManagerId || selectedManagerId === vendor.account_manager_id}
        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Assign'}
      </button>
      {vendor.account_manager_id && (
        <button
          type="button"
          onClick={onRemove}
          disabled={saving}
          className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          Remove
        </button>
      )}
    </div>
  );
}

function CopyableField({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string;
  value: string | null;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <Field label={label}>
      {value ? (
        <div className="flex items-center gap-2">
          <p className="break-all font-mono text-xs sm:text-sm">{value}</p>
          <CopyButton copied={copied} label={`Copy ${label}`} onClick={onCopy} />
        </div>
      ) : (
        '—'
      )}
    </Field>
  );
}
