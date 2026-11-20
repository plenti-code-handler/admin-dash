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
  ExclamationCircleIcon,
  MapPinIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import Sidebar, { SidebarMenuButton, SidebarProvider } from '@/components/layout/Sidebar';
import ToastNotice, { type ToastState } from '@/components/common/ToastNotice';
import { useMyPermissions } from '@/hooks/useMyPermissions';
import { getApiErrorDetail } from '@/utils/apiError';
import { hasPermission } from '@/utils/permissions';
import axiosClient from '../../../../AxiosClient';
import VendorPricing from '@/components/vendors/catalogue/VendorPricing';

interface VendorDetails {
  vendor_id: string;
  vendor_name: string;
  username: string | null;
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
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const [managers, setManagers] = useState<AccountManagerOption[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [savingManager, setSavingManager] = useState(false);
  const { permissions } = useMyPermissions();
  const canAssign = hasPermission(permissions, 'vendors:assign');
  const canReadCatalogue = hasPermission(permissions, 'catalogue:read');
  const [tab, setTab] = useState<'details' | 'pricing'>('details');
  const activeTab = canReadCatalogue ? tab : 'details';

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

  const handleDeleteVendor = async () => {
    if (!vendor_id) return;

    try {
      setDeleting(true);
      const url = buildApiUrl('/v1/superuser/vendor/delete', {
        vendor_id: vendor_id as string,
      });
      await axiosClient.delete(url);
      router.push('/dashboard/vendors');
    } catch (err) {
      logger.error('Error deleting vendor:', err);
      setToast({ message: getApiErrorDetail(err, 'Failed to delete vendor'), variant: 'error' });
      setDeleting(false);
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

  const typeLabel = vendor?.vendor_type
    ? vendor.vendor_type
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : '';

  return (
    <SidebarProvider>
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex h-14 items-center border-b border-gray-200 bg-white px-3 lg:hidden">
          <SidebarMenuButton />
        </div>
        <div className={`mx-auto space-y-6 p-4 sm:p-6 max-w-6xl`}>
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
            </div>
          ) : error || !vendor ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="py-12 text-center">
                <h3 className="mb-2 text-sm font-medium text-gray-900">Vendor unavailable</h3>
                <p className="mb-4 text-sm text-gray-500">{error || 'Vendor not found'}</p>
                <button
                  onClick={() => router.push('/dashboard/vendors')}
                  className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back to Vendors
                </button>
              </div>
            </div>
          ) : (
            <>
              <header className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {vendor.backcover_url && (
                  <img
                    src={vendor.backcover_url}
                    alt=""
                    className="h-28 w-full object-cover sm:h-36"
                  />
                )}
                <div className="p-4 sm:p-6">
                  <button
                    onClick={() => router.back()}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                    Vendors
                  </button>

                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
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
                        <h1 className="truncate text-xl font-semibold tracking-tight text-gray-900">
                          {vendor.vendor_name}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                          {typeLabel} · Created {formatDate(vendor.created_at)}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <StatusBadge
                            label={vendor.account_approved ? 'Approved' : 'Pending approval'}
                            tone={vendor.account_approved ? 'blue' : 'orange'}
                          />
                          <StatusBadge
                            label={vendor.mou_signed ? 'MOU signed' : 'MOU unsigned'}
                            tone={vendor.mou_signed ? 'green' : 'gray'}
                          />
                          <StatusBadge
                            label={vendor.is_active ? 'Dashboard active' : 'Dashboard inactive'}
                            tone={vendor.is_active ? 'green' : 'gray'}
                          />
                          <StatusBadge
                            label={vendor.is_online ? 'Online' : 'Offline'}
                            tone={vendor.is_online ? 'blue' : 'gray'}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {!vendor.account_approved ? (
                        <button
                          onClick={handleApproveVendor}
                          disabled={approving || deleting}
                          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {approving ? 'Approving...' : 'Approve vendor'}
                        </button>
                      ) : (
                        <button
                          onClick={handleDeactivateVendor}
                          disabled={deactivating || deleting}
                          className="inline-flex items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                        >
                          {deactivating ? 'Deactivating...' : 'Deactivate'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteOpen(true)}
                        disabled={deleting}
                        className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        Delete account
                      </button>
                    </div>
                  </div>
                </div>
              </header>

              <TabGroup
                selectedIndex={canReadCatalogue && activeTab === 'pricing' ? 1 : 0}
                onChange={(index) => setTab(index === 1 ? 'pricing' : 'details')}
              >
                {canReadCatalogue && (
                  <TabList className="relative inline-grid grid-cols-2 rounded-lg bg-gray-100 p-1">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute bottom-0 top-0 z-0 w-1/2 rounded-md bg-white shadow-sm ring-1 ring-black/[0.04] transition-[left] duration-200 ease-out"
                      style={{
                        gridColumn: '1 / -1',
                        gridRow: '1',
                        left: activeTab === 'pricing' ? '50%' : '0%',
                      }}
                    />
                    {(['Details', 'Pricing'] as const).map((label) => (
                      <Tab
                        key={label}
                        className="relative z-10 min-w-[5.5rem] rounded-md px-4 py-1.5 text-center text-sm font-medium text-gray-500 outline-none transition-colors duration-200 data-[focus]:ring-2 data-[focus]:ring-indigo-500/30 data-[hover]:text-gray-800 data-[selected]:text-gray-900"
                      >
                        {label}
                      </Tab>
                    ))}
                  </TabList>
                )}
                <TabPanels className={canReadCatalogue ? 'mt-6' : undefined}>
                  <TabPanel className="tab-enter outline-none">
                    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
                      <div className="space-y-6">
                        <Section title="Contact">
                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            <Field label="Username">
                              <p className="break-all font-mono text-xs sm:text-sm">{vendor.username || '—'}</p>
                            </Field>
                            <Field label="Email">
                              {vendor.email ? (
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
                              ) : (
                                '—'
                              )}
                            </Field>
                            <Field label="Phone">
                              {vendor.phone_number ? (
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
                              ) : (
                                '—'
                              )}
                            </Field>
                          </div>
                        </Section>

                        <Section title="Compliance">
                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <CopyableField
                              label="GST"
                              value={vendor.gst_number}
                              copied={copied === 'gst'}
                              onCopy={() => vendor.gst_number && copyValue(vendor.gst_number, 'gst', 'GST number')}
                            />
                            <CopyableField
                              label="FSSAI"
                              value={vendor.fssai_number}
                              copied={copied === 'fssai'}
                              onCopy={() =>
                                vendor.fssai_number && copyValue(vendor.fssai_number, 'fssai', 'FSSAI number')
                              }
                            />
                            <CopyableField
                              label="PAN"
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
                          </div>
                        </Section>

                        <Section title="Location">
                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                                  className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-800"
                                >
                                  Open in maps
                                  <ArrowTopRightOnSquareIcon className="ml-1.5 h-4 w-4" />
                                </a>
                              ) : (
                                '—'
                              )}
                            </Field>
                          </div>
                        </Section>
                      </div>

                      <aside>
                        <Section title="Account manager">
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
                            <p className="text-sm text-gray-900">{vendor.account_manager || '—'}</p>
                          )}
                        </Section>
                      </aside>
                    </div>
                  </TabPanel>
                  {canReadCatalogue && (
                    <TabPanel className="tab-enter outline-none">
                      <VendorPricing vendorId={vendor.vendor_id} />
                    </TabPanel>
                  )}
                </TabPanels>
              </TabGroup>
            </>
          )}
        </div>
      </div>
      <DeleteAccountDialog
        open={deleteOpen}
        vendorName={vendor?.vendor_name}
        deleting={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteVendor}
      />
      <ToastNotice toast={toast} onDismiss={dismissToast} />
    </div>
    </SidebarProvider>
  );
}

function DeleteAccountDialog({
  open,
  vendorName,
  deleting,
  onClose,
  onConfirm,
}: {
  open: boolean;
  vendorName?: string;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onClose={deleting ? () => undefined : onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/40 transition-opacity duration-200 data-[closed]:opacity-0"
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          transition
          className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl transition duration-200 data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 ring-4 ring-red-100">
              <ExclamationCircleIcon className="h-6 w-6" aria-hidden="true" />
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <DialogTitle className="mt-4 text-base font-semibold text-gray-900">Delete account?</DialogTitle>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            {vendorName ? `${vendorName} will be removed from the dashboard. ` : ''}
            Their email and phone number will be detached, and the account cannot be restored from here.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="inline-flex flex-1 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="inline-flex flex-1 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete account'}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
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
    <div className="space-y-3">
      <select
        value={selectedManagerId}
        onChange={(event) => onSelect(event.target.value)}
        disabled={saving}
        aria-label="Account manager"
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 disabled:opacity-50"
      >
        <option value="">Select a manager</option>
        {options.map((manager) => (
          <option key={manager.id} value={manager.id}>
            {manager.name || manager.id}
          </option>
        ))}
      </select>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onAssign}
          disabled={saving || !selectedManagerId || selectedManagerId === vendor.account_manager_id}
          className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Assign'}
        </button>
        {vendor.account_manager_id && (
          <button
            type="button"
            onClick={onRemove}
            disabled={saving}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>
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
