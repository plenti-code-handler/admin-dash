'use client';

import { Fragment, useCallback, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { buildApiUrl } from '@/config';
import { axiosFormClient } from '../../../AxiosClient';
import { getApiErrorDetail } from '@/utils/apiError';
import { suggestionListHovered, usePlaceAutocomplete, type SelectedPlace } from '@/hooks/usePlaceAutocomplete';

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

const inputClass =
  'block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none focus:ring-0 transition-colors sm:px-4 sm:py-2.5';

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
  const addressRef = useRef<HTMLInputElement>(null);

  const applyPlace = useCallback((place: SelectedPlace) => {
    setFormData((prev) => ({
      ...prev,
      address: place.address,
      address_url: place.addressUrl,
      latitude: String(place.latitude),
      longitude: String(place.longitude),
    }));
    setError(null);
  }, []);

  const { ready: placesReady, error: placesError } = usePlaceAutocomplete(addressRef, isOpen, applyPlace);

  const updateField = (key: keyof typeof INITIAL_FORM, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const clearPlace = () => {
    setFormData((prev) => ({ ...prev, address: '', address_url: '', latitude: '', longitude: '' }));
    if (addressRef.current) addressRef.current.value = '';
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    if (addressRef.current) addressRef.current.value = '';
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
      if (file) form.append('file', file);

      const url = buildApiUrl('/v1/superuser/vendor/parent/add');
      await axiosFormClient.post(url, form);
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(getApiErrorDetail(err, err instanceof Error ? err.message : 'Failed to create parent vendor'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => {
          if (suggestionListHovered()) return;
          handleClose();
        }}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white px-4 pb-4 pt-4 text-left shadow-lg transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:px-6 sm:pb-6 sm:pt-6 md:px-8 md:pb-8 md:pt-8">
                <div className="absolute right-0 top-0 pr-4 pt-4 sm:pr-6 sm:pt-6">
                  <button
                    type="button"
                    className="rounded-lg text-gray-400 transition-colors hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2"
                    onClick={handleClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="w-full pr-8 sm:pr-0">
                  <div className="mb-6 sm:mb-8">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 sm:text-xl sm:leading-7"
                    >
                      Create parent vendor
                    </Dialog.Title>
                    <p className="mt-1.5 text-xs text-gray-500 sm:text-sm">
                      Fill in the brand headquarters account. Logo is optional.
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 rounded-lg border border-red-100 bg-red-50 p-3 sm:mb-6 sm:p-4">
                      <h3 className="text-xs font-medium text-red-800 sm:text-sm">Error</h3>
                      <p className="mt-1 text-xs text-red-700 sm:text-sm">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      <Field label="Legal / brand name" required>
                        <input
                          required
                          value={formData.legal_name}
                          onChange={(e) => updateField('legal_name', e.target.value)}
                          className={inputClass}
                          placeholder="Registered brand name"
                        />
                      </Field>
                      <Field label="Contact person" required>
                        <input
                          required
                          value={formData.contact_person}
                          onChange={(e) => updateField('contact_person', e.target.value)}
                          className={inputClass}
                          placeholder="Primary contact"
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      <Field label="Username" required>
                        <input
                          required
                          value={formData.username}
                          onChange={(e) => updateField('username', e.target.value)}
                          className={inputClass}
                          placeholder="Login username"
                        />
                      </Field>
                      <Field label="Email" required>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => updateField('email', e.target.value)}
                          className={inputClass}
                          placeholder="name@brand.com"
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      <Field label="Password" required>
                        <input
                          type="password"
                          required
                          value={formData.password}
                          onChange={(e) => updateField('password', e.target.value)}
                          className={inputClass}
                          placeholder="Account password"
                        />
                      </Field>
                      <Field label="Phone number" required>
                        <input
                          required
                          value={formData.phone_number}
                          onChange={(e) => updateField('phone_number', e.target.value)}
                          className={inputClass}
                          placeholder="10-digit phone"
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
                      <Field label="GST number" required>
                        <input
                          required
                          value={formData.gst_number}
                          onChange={(e) => updateField('gst_number', e.target.value.toUpperCase())}
                          className={inputClass}
                          placeholder="GSTIN"
                        />
                      </Field>
                      <Field label="PAN number" required>
                        <input
                          required
                          value={formData.pan_number}
                          onChange={(e) => updateField('pan_number', e.target.value.toUpperCase())}
                          className={inputClass}
                          placeholder="PAN"
                        />
                      </Field>
                    </div>

                    <Field label="Address" optional>
                      <input
                        ref={addressRef}
                        type="text"
                        className={inputClass}
                        placeholder={placesReady ? 'Search a place in India' : 'Loading address search…'}
                        disabled={!placesReady}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.preventDefault();
                        }}
                      />
                      {placesError && <p className="mt-1.5 text-xs text-red-600">{placesError}</p>}
                      {formData.latitude && formData.longitude ? (
                        <div className="mt-2 flex items-start justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
                          <p className="min-w-0 text-xs text-gray-500">
                            <span className="block truncate text-sm text-gray-900">{formData.address}</span>
                            {formData.latitude}, {formData.longitude}
                            {formData.address_url && (
                              <>
                                {' · '}
                                <a
                                  href={formData.address_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-indigo-600 hover:underline"
                                >
                                  Open map
                                </a>
                              </>
                            )}
                          </p>
                          <button
                            type="button"
                            onClick={clearPlace}
                            className="shrink-0 text-xs font-medium text-gray-500 hover:text-gray-800"
                          >
                            Clear
                          </button>
                        </div>
                      ) : (
                        <p className="mt-1.5 text-xs text-gray-500">
                          Pick a suggestion to set the address, map link, and coordinates.
                        </p>
                      )}
                    </Field>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm">
                        Brand logo
                        <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span>
                      </label>
                      <div className="flex flex-col items-start gap-4 sm:flex-row">
                        <label className="flex w-full flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 transition-colors hover:border-gray-400 hover:bg-gray-100">
                          <PhotoIcon className="mb-2 h-8 w-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {file ? file.name : 'Click to upload logo'}
                          </span>
                          <span className="mt-1 text-xs text-gray-400">JPEG or PNG, max 500KB</span>
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
                            className="h-24 w-24 rounded-lg border border-gray-200 object-cover"
                          />
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-0 sm:w-auto sm:px-5"
                        onClick={handleClose}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-5"
                      >
                        {loading ? 'Creating...' : 'Create parent vendor'}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function Field({
  label,
  required,
  optional,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-700 sm:mb-2 sm:text-sm">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
        {optional ? <span className="ml-1 text-xs font-normal text-gray-500">(Optional)</span> : null}
      </label>
      {children}
    </div>
  );
}
