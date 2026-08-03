'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  ShoppingBagIcon,
  TicketIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/outline';
import { hasModuleAccess } from '@/utils/permissions';
import { useMyPermissions } from '@/hooks/useMyPermissions';

const menuItems = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon, module: 'dashboard' },
  { name: 'Users', href: '/dashboard/users', icon: UsersIcon, module: 'users' },
  { name: 'Vendors', href: '/dashboard/vendors', icon: BuildingStorefrontIcon, module: 'vendors' },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBagIcon, module: 'orders' },
  { name: 'Coupons', href: '/dashboard/coupons', icon: TicketIcon, module: 'coupons' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { permissions } = useMyPermissions();

  const visibleItems = menuItems.filter((item) =>
    hasModuleAccess(permissions, item.module)
  );

  return (
    <aside className="w-16 md:w-20 flex flex-col items-center py-6 bg-[#5F22D9] min-h-screen">
      <div className="mb-10 flex justify-center w-full">
        <Link href="/dashboard" className="flex items-center justify-center">
          <Image
            src="/images/plenti-logo.png"
            alt="Plenti Logo"
            width={36}
            height={18}
            className="object-contain opacity-80 grayscale invert"
          />
        </Link>
      </div>

      <nav className="flex flex-col gap-2 w-full">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex flex-col items-center justify-center py-3 rounded-lg transition
                ${isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
                }
              `}
              title={item.name}
            >
              <item.icon
                className={`w-6 h-6 mb-1 transition ${
                  isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
                }`}
              />
              <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
