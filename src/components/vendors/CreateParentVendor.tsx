'use client';

import { useState } from 'react';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { useMyPermissions } from '@/hooks/useMyPermissions';
import { hasPermission } from '@/utils/permissions';
import AddParentVendorModal from './AddParentVendorModal';

export default function CreateParentVendor() {
  const { permissions } = useMyPermissions();
  const [open, setOpen] = useState(false);

  if (!hasPermission(permissions, 'vendors:create')) return null;

  return (
    <>
      <div className="glass-card space-y-3 rounded-xl p-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Create</h2>
          <p className="mt-0.5 text-xs text-gray-500">Add a brand headquarters</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <BuildingStorefrontIcon className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-gray-900">Parent vendor</span>
            <span className="mt-0.5 block truncate text-xs text-gray-500">
              Create a brand account and optional logo
            </span>
          </span>
        </button>
      </div>

      <AddParentVendorModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
