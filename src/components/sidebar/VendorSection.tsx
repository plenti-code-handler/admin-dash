import { BuildingStorefrontIcon, UserGroupIcon, CheckCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { SidebarItem } from '@/types/sidebar';

export const vendorMenuItems: SidebarItem[] = [
  {
    name: 'All Vendors',
    href: '/dashboard/vendors',
    icon: BuildingStorefrontIcon,
  },
  {
    name: 'Pending Approvals',
    href: '/dashboard/vendors/pending',
    icon: CheckCircleIcon,
  },
  {
    name: 'Vendor Analytics',
    href: '/dashboard/vendors/analytics',
    icon: ChartBarIcon,
  },
]; 