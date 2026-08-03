'use client';

interface PermissionListProps {
  permissions: string[] | null | undefined;
  emptyLabel?: string;
}

function formatPermission(permission: string): string {
  if (permission === '*') return 'Full admin (*)';
  if (permission.endsWith(':*')) {
    const module = permission.slice(0, -2);
    return `${module} (all)`;
  }
  return permission;
}

function chipClass(permission: string): string {
  if (permission === '*') {
    return 'bg-[#5F22D9] text-white border-transparent';
  }
  if (permission.endsWith(':*')) {
    return 'bg-[#5F22D9]/10 text-[#5F22D9] border-[#5F22D9]/20';
  }
  return 'bg-gray-50 text-gray-700 border-gray-200';
}

/** Standardized permission chips for profile / admin UIs. */
export default function PermissionList({
  permissions,
  emptyLabel = 'No permissions assigned',
}: PermissionListProps) {
  const list = permissions || [];

  if (list.length === 0) {
    return <p className="text-sm text-gray-400">{emptyLabel}</p>;
  }

  const sorted = [...list].sort((a, b) => {
    if (a === '*') return -1;
    if (b === '*') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map((permission) => (
        <span
          key={permission}
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${chipClass(permission)}`}
          title={permission}
        >
          {formatPermission(permission)}
        </span>
      ))}
    </div>
  );
}
