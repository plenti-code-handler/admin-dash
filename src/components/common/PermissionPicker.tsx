'use client';
import {
  PERMISSION_MODULES,
  togglePermission,
} from '@/utils/permissions';
import PermissionList from '@/components/common/PermissionList';

interface PermissionPickerProps {
  value: string[];
  onChange: (permissions: string[]) => void;
}

export default function PermissionPicker({ value, onChange }: PermissionPickerProps) {
  const selected = new Set(value);
  const isFullAdmin = selected.has('*');

  const handleToggle = (permission: string) => {
    onChange(togglePermission(value, permission));
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2.5 rounded-xl border border-[#5F22D9]/20 bg-[#5F22D9]/5 px-3 py-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={isFullAdmin}
          onChange={() => handleToggle('*')}
          className="h-4 w-4 rounded border-gray-300 text-[#5F22D9] focus:ring-[#5F22D9]"
        />
        <div>
          <p className="text-sm font-medium text-gray-900">Full admin (*)</p>
          <p className="text-xs text-gray-500">Access to every section and action</p>
        </div>
      </label>

      <div
        className={`space-y-3 ${isFullAdmin ? 'opacity-40 pointer-events-none' : ''}`}
      >
        {PERMISSION_MODULES.map((module) => {
          const moduleAll = `${module.key}:*`;
          const hasModuleAll = selected.has(moduleAll);

          return (
            <div
              key={module.key}
              className="rounded-xl border border-gray-200 bg-white px-3 py-3"
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-sm font-medium text-gray-900">{module.label}</p>
                <label className="inline-flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasModuleAll}
                    onChange={() => handleToggle(moduleAll)}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-[#5F22D9] focus:ring-[#5F22D9]"
                  />
                  All ({moduleAll})
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {module.actions.map((action) => {
                  // admin module action key is already "*"
                  const permission =
                    action.key === '*' ? `${module.key}:*` : `${module.key}:${action.key}`;
                  // For admin with only "All", skip duplicate action row
                  if (module.key === 'admin' && action.key === '*') {
                    return null;
                  }
                  const checked = hasModuleAll || selected.has(permission);

                  return (
                    <label
                      key={permission}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        checked
                          ? 'border-[#5F22D9]/30 bg-[#5F22D9]/5 text-[#5F22D9]'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={hasModuleAll}
                        onChange={() => handleToggle(permission)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-[#5F22D9] focus:ring-[#5F22D9]"
                      />
                      {action.label}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">Payload preview</p>
        <PermissionList permissions={value} emptyLabel="No permissions selected" />
      </div>
    </div>
  );
}
