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
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import Sidebar, { SidebarMenuButton, SidebarProvider } from '@/components/layout/Sidebar';
import ToastNotice, { type ToastState } from '@/components/common/ToastNotice';
import { useMyPermissions } from '@/hooks/useMyPermissions';
import { getApiErrorDetail } from '@/utils/apiError';
import { hasPermission } from '@/utils/permissions';
import axiosClient from '../../../../AxiosClient';

interface ParentDetails {
  vendor_id: string;
  email: string | null;
  username: string | null;
  phone_number: string | null;
  contact_person: string | null;
  legal_name: string | null;
  gst_number: string | null;
  pan_number: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  address_url: string | null;
  logo_url: string | null;
  created_at: number | null;
  is_active: boolean | null;
  total_orders: number;
  total_revenue: number;
  total_balance: number;
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-gray-900">{value}</p>
    </div>
  );
}

export default function ParentDetailsPage() {
  const params = useParams();
  const parentId = Array.isArray(params.parent_id) ? params.parent_id[0] : params.parent_id;
  const router = useRouter();
  const { permissions } = useMyPermissions();
  const canWrite = hasPermission(permissions, 'vendors:write');

  const [parent, setParent] = useState<ParentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [issuingCode, setIssuingCode] = useState(false);
  const [loginCode, setLoginCode] = useState<{ otp: string; expires_at: number } | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const fetchParent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get<ParentDetails>(`/v1/superuser/vendor/parent/get/${parentId}`);
        setParent(data);
        setLogoFailed(false);
      } catch (err) {
        logger.error('Error fetching parent details:', err);
        setError('Failed to load parent details');
      } finally {
        setLoading(false);
      }
    };
    if (parentId) fetchParent();
  }, [parentId]);

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

  const handleIssueLoginCode = async () => {
    if (!parentId) return;
    try {
      setIssuingCode(true);
      const url = buildApiUrl('/v1/superuser/vendor/internal-login-otp', { vendor_id: parentId });
      const response = await axiosClient.post(url);
      setLoginCode({ otp: response.data.otp, expires_at: response.data.expires_at });
    } catch (err) {
      logger.error('Error issuing internal login code:', err);
      setToast({ message: getApiErrorDetail(err, 'Failed to create login code'), variant: 'error' });
    } finally {
      setIssuingCode(false);
    }
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return '—';
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const money = (value: number) =>
    `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const name = parent?.legal_name || 'Unnamed brand';

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <div className="sticky top-0 z-30 flex h-14 items-center border-b border-gray-200 bg-white px-3 lg:hidden">
            <SidebarMenuButton />
          </div>
          <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
              </div>
            ) : error || !parent ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="py-12 text-center">
                  <h3 className="mb-2 text-sm font-medium text-gray-900">Parent unavailable</h3>
                  <p className="mb-4 text-sm text-gray-500">{error || 'Parent not found'}</p>
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
                <header className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                  <button
                    onClick={() => router.push('/dashboard/vendors')}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900"
                  >
                    <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                    Vendors
                  </button>
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                        {parent.logo_url && !logoFailed ? (
                          <img
                            src={parent.logo_url}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={() => setLogoFailed(true)}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-indigo-600">
                            {name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h1 className="text-xl font-semibold tracking-tight text-gray-900">{name}</h1>
                        <p className="mt-1 text-sm text-gray-500">
                          Parent brand · Created {formatDate(parent.created_at)}
                        </p>
                        <span
                          className={`mt-3 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            parent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {parent.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    {canWrite && (
                      <button
                        type="button"
                        onClick={handleIssueLoginCode}
                        disabled={issuingCode}
                        className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {issuingCode ? 'Creating...' : 'Login code'}
                      </button>
                    )}
                  </div>
                </header>

                <div className="grid gap-4 sm:grid-cols-3">
                  <Stat label="Total orders" value={Number(parent.total_orders || 0).toLocaleString('en-IN')} />
                  <Stat label="Total revenue" value={money(parent.total_revenue)} />
                  <Stat label="Total balance" value={money(parent.total_balance)} />
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-2">
                  <Section title="Account">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <CopyField
                        label="Email"
                        value={parent.email}
                        copied={copied === 'email'}
                        onCopy={() => parent.email && copyValue(parent.email, 'email', 'Email')}
                      />
                      <CopyField
                        label="Username"
                        value={parent.username}
                        copied={copied === 'username'}
                        onCopy={() => parent.username && copyValue(parent.username, 'username', 'Username')}
                      />
                      <Field label="Phone">{parent.phone_number || '—'}</Field>
                      <Field label="Contact person">{parent.contact_person || '—'}</Field>
                      <Field label="Vendor ID">
                        <div className="flex items-start gap-2">
                          <p className="break-all font-mono text-xs sm:text-sm">{parent.vendor_id}</p>
                          <button
                            type="button"
                            onClick={() => copyValue(parent.vendor_id, 'id', 'Vendor ID')}
                            className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Copy vendor ID"
                          >
                            {copied === 'id' ? (
                              <CheckIcon className="h-4 w-4 text-green-600" />
                            ) : (
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </Field>
                    </div>
                  </Section>

                  <Section title="Brand">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="GST">{parent.gst_number || '—'}</Field>
                      <Field label="PAN">{parent.pan_number || '—'}</Field>
                      <Field label="Address">
                        <div className="flex items-start gap-2">
                          <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                          <p className="break-words">{parent.address || '—'}</p>
                        </div>
                      </Field>
                      <Field label="Map">
                        {parent.address_url ? (
                          <a
                            href={parent.address_url}
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
              </>
            )}
          </div>
        </div>
        <LoginCodeDialog
          open={!!loginCode}
          otp={loginCode?.otp || ''}
          expiresAt={loginCode?.expires_at}
          copied={copied === 'login-code'}
          onCopy={() => loginCode && copyValue(loginCode.otp, 'login-code', 'Login code')}
          onClose={() => setLoginCode(null)}
        />
        <ToastNotice toast={toast} onDismiss={dismissToast} />
      </div>
    </SidebarProvider>
  );
}

function CopyField({
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
          <p className="break-all">{value}</p>
          <button
            type="button"
            onClick={onCopy}
            className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label={`Copy ${label}`}
          >
            {copied ? <CheckIcon className="h-4 w-4 text-green-600" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
          </button>
        </div>
      ) : (
        '—'
      )}
    </Field>
  );
}

function LoginCodeDialog({
  open,
  otp,
  expiresAt,
  copied,
  onCopy,
  onClose,
}: {
  open: boolean;
  otp: string;
  expiresAt?: number;
  copied: boolean;
  onCopy: () => void;
  onClose: () => void;
}) {
  const expiresLabel = expiresAt
    ? new Date(expiresAt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '';

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/40" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="text-base font-semibold text-gray-900">Internal login code</DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Use this once as the password. It expires at {expiresLabel}.
          </p>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <span className="font-mono text-lg tracking-widest text-gray-900">{otp}</span>
            <button type="button" onClick={onCopy} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
