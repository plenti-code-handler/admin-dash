'use client';
import { ReactNode } from 'react';
import { hasPermission } from '@/utils/permissions';

interface CanProps {
  permissions: string[] | null | undefined;
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/** Renders children only when the user has the required permission. */
export default function Can({
  permissions,
  permission,
  children,
  fallback = null,
}: CanProps) {
  if (!hasPermission(permissions, permission)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
