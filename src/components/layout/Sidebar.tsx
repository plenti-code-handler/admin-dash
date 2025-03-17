'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { HomeIcon, UsersIcon, ShoppingBagIcon, CreditCardIcon, TicketIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon },
    { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
    { name: 'Vendors', href: '/dashboard/vendors', icon: BuildingStorefrontIcon },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBagIcon },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCardIcon },
    { name: 'Coupons', href: '/dashboard/coupons', icon: TicketIcon },
  ];

  return (
    <aside className="w-64 bg-[#5F22D9] min-h-screen">
      {/* Logo section */}
      <div className="px-4 py-6 flex justify-center">
        <Link href="/dashboard">
          <Image
            src="/images/plenti-logo.png"
            alt="Plenti Logo"
            width={120}
            height={59}
            className="object-contain"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 ${
                isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-6 h-6 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}