/**
 * Grant if user has exact permission, module wildcard (orders:*), or global (*).
 * Mirrors backend has_superuser_permission.
 */
export function hasPermission(
  permissions: string[] | null | undefined,
  required: string
): boolean {
  if (!required) return false;

  const granted = new Set(permissions || []);
  if (granted.has('*')) return true;

  // require "*" — only full admins
  if (required === '*') return false;

  if (granted.has(required)) return true;

  if (!required.includes(':')) return false;

  const module = required.split(':')[0];
  return Boolean(module) && granted.has(`${module}:*`);
}

/** True if user has "*" or any permission for the module prefix (e.g. "orders:"). */
export function hasModuleAccess(
  permissions: string[] | null | undefined,
  module: string
): boolean {
  if (!module) return false;
  const granted = permissions || [];
  if (granted.includes('*')) return true;
  const prefix = `${module}:`;
  return granted.some((permission) => permission.startsWith(prefix));
}

export type PermissionAction = {
  key: string;
  label: string;
};

export type PermissionModule = {
  key: string;
  label: string;
  actions: PermissionAction[];
};

/** Catalog of admin sections — keep in sync with backend require_permission usage. */
export const PERMISSION_MODULES: PermissionModule[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    actions: [{ key: 'read', label: 'Read' }],
  },
  {
    key: 'users',
    label: 'Users',
    actions: [
      { key: 'read', label: 'Read' },
      { key: 'write', label: 'Write' },
    ],
  },
  {
    key: 'vendors',
    label: 'Vendors',
    actions: [
      { key: 'read', label: 'Read' },
      { key: 'write', label: 'Write' },
      { key: 'create', label: 'Create' },
      { key: 'approve', label: 'Approve' },
      { key: 'bank_account', label: 'Bank Account' },
      { key: 'payout', label: 'Payout' },
    ],
  },
  {
    key: 'orders',
    label: 'Orders',
    actions: [
      { key: 'read', label: 'Read' },
      { key: 'refund', label: 'Refund' },
    ],
  },
  {
    key: 'coupons',
    label: 'Coupons',
    actions: [
      { key: 'read', label: 'Read' },
      { key: 'create', label: 'Create' },
      { key: 'write', label: 'Write' },
      { key: 'delete', label: 'Delete' },
    ],
  },
  {
    key: 'catalogue',
    label: 'Catalogue',
    actions: [
      { key: 'read', label: 'Read' },
      { key: 'approve', label: 'Approve' },
    ],
  },
  {
    key: 'payments',
    label: 'Payments',
    actions: [
      { key: 'read', label: 'Read' },
      { key: 'write', label: 'Write' },
    ],
  },
  {
    key: 'support',
    label: 'Support',
    actions: [
      { key: 'read', label: 'Read' },
      { key: 'create', label: 'Create' },
      { key: 'write', label: 'Write' },
    ],
  },
  {
    key: 'notifications',
    label: 'Notifications',
    actions: [{ key: 'send', label: 'Send' }],
  },
  {
    key: 'banners',
    label: 'Banners',
    actions: [{ key: 'write', label: 'Write' }],
  },
  {
    key: 'admin',
    label: 'Admin',
    actions: [{ key: '*', label: 'All admin tools' }],
  },
];

/** Normalize a permission list for editing (prefer module:* over listing every action). */
export function normalizePermissionsForPicker(permissions: string[]): string[] {
  return Array.from(new Set(permissions || [])).sort((a, b) => {
    if (a === '*') return -1;
    if (b === '*') return 1;
    return a.localeCompare(b);
  });
}

/** Toggle a permission string in a selected set, returning a new sorted array. */
export function togglePermission(selected: string[], permission: string): string[] {
  const next = new Set(selected);
  if (next.has(permission)) {
    next.delete(permission);
  } else {
    next.add(permission);
  }

  // Selecting full admin clears everything else
  if (permission === '*' && next.has('*')) {
    return ['*'];
  }

  // Selecting anything else removes full admin
  if (permission !== '*') {
    next.delete('*');
  }

  // Selecting module:* clears individual actions in that module
  if (permission.endsWith(':*') && next.has(permission)) {
    const module = permission.slice(0, -2);
    for (const value of Array.from(next)) {
      if (value !== permission && value.startsWith(`${module}:`)) {
        next.delete(value);
      }
    }
  }

  // Selecting an individual action clears that module's wildcard
  if (permission.includes(':') && !permission.endsWith(':*') && permission !== '*') {
    const module = permission.split(':')[0];
    next.delete(`${module}:*`);
  }

  return Array.from(next).sort((a, b) => {
    if (a === '*') return -1;
    if (b === '*') return 1;
    return a.localeCompare(b);
  });
}
