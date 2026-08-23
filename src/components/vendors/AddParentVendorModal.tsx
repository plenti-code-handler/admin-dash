'use client';
import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { BuildingStorefrontIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { buildApiUrl } from '@/config';
import { axiosFormClient } from '../../../AxiosClient';
import { getApiErrorDetail } from '@/utils/apiError';

interface AddParentVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const INITIAL_FORM = {
  username: '',
  email: '',
  password: '',
  phone_number: '',
  contact_person: '',
  legal_name: '',
  gst_number: '',
  pan_number: '',
  address: '',
  address_url: '',
  latitude: '',
  longitude: '',
};

export default function AddParentVendorModal({
  isOpen,
  onClose,
  onSuccess,
}: AddParentVendorModalProps) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateField = (key: keyof typeof INITIAL_FORM, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] || null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(next ? URL.createObjectURL(next) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone_number: formData.phone_number.trim(),
        contact_person: formData.contact_person.trim(),
        legal_name: formData.legal_name.trim(),
        gst_number: formData.gst_number.trim().toUpperCase(),
        pan_number: formData.pan_number.trim().toUpperCase(),
        address: formData.address.trim() || null,
        address_url: formData.address_url.trim() || null,
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
      };

      if (payload.latitude != null && Number.isNaN(payload.latitude)) {
        throw new Error('Latitude must be a valid number');
      }
      if (payload.longitude != null && Number.isNaN(payload.longitude)) {
        throw new Error('Longitude must be a valid number');
      }

      const form = new FormData();
      form.append('data', JSON.stringify(payload));
      if (file) {
        form.append('file', file);
      }

      const url = buildApiUrl('/v1/superuser/vendor/parent/add');
      const response = await axiosFormClient.post(url, form);
      setSuccess(response.data?.message || 'Parent vendor created successfully');
      onSuccess?.();
      setTimeout(() => {
        resetForm();
        onClose();
      }, 800);
    } catch (err: unknown) {
      setError(getApiErrorDetail(err, err instanceof Error ? err.message : 'Failed to create parent vendor'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 sm:items-center sm:p-6">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5F22D9]/10">
                      <BuildingStorefrontIcon className="h-5 w-5 text-[#5F22D9]" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Add parent vendor
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        Create a brand headquarters account with optional logo
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto px-5 py-5 sm:px-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Legal / brand name" required>
                      <input
                        required
                        value={formData.legal_name}
                        onChange={(e) => updateField('legal_name', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Contact person" required>
                      <input
                        required
                        value={formData.contact_person}
                        onChange={(e) => updateField('contact_person', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Username" required>
                      <input
                        required
                        value={formData.username}
                        onChange={(e) => updateField('username', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Email" required>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Password" required>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Phone number" required>
                      <input
                        required
                        value={formData.phone_number}
                        onChange={(e) => updateField('phone_number', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="GST number" required>
                      <input
                        required
                        value={formData.gst_number}
                        onChange={(e) => updateField('gst_number', e.target.value.toUpperCase())}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="PAN number" required>
                      <input
                        required
                        value={formData.pan_number}
                        onChange={(e) => updateField('pan_number', e.target.value.toUpperCase())}
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label="Address">
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      className={inputClass}
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Maps URL">
                      <input
                        value={formData.address_url}
                        onChange={(e) => updateField('address_url', e.target.value)}
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Latitude">
                      <input
                        value={formData.latitude}
                        onChange={(e) => updateField('latitude', e.target.value)}
                        className={inputClass}
                        placeholder="12.9716"
                      />
                    </Field>
                    <Field label="Longitude">
                      <input
                        value={formData.longitude}
                        onChange={(e) => updateField('longitude', e.target.value)}
                        className={inputClass}
                        placeholder="77.5946"
                      />
                    </Field>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Brand logo
                    </label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 hover:border-[#5F22D9]/40 hover:bg-[#5F22D9]/5 transition-colors">
                        <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          {file ? file.name : 'Click to upload logo (optional)'}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">JPEG/PNG, max ~500KB</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </label>
                      {previewUrl && (
                        <img
                          src={previewUrl}
                          alt="Logo preview"
                          className="h-24 w-24 rounded-xl object-cover border border-gray-200"
                        />
                      )}
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-500">{error}</p>}
                  {success && <p className="text-sm text-green-600">{success}</p>}

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-[#5F22D9] hover:bg-[#4f1cb8] disabled:opacity-50"
                    >
                      {loading ? 'Creating…' : 'Create parent vendor'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

const inputClass =
  'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5F22D9]/30 focus:border-[#5F22D9]';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      {children}
    </div>
  );
}
