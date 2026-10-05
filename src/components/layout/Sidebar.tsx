'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import {
  Bars3Icon,
  BuildingStorefrontIcon,
  HomeIcon,
  ShoppingBagIcon,
  TicketIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { hasModuleAccess } from '@/utils/permissions';
import { useMyPermissions } from '@/hooks/useMyPermissions';

const STORAGE_KEY = 'admin_sidebar_open';

type MenuItem = {
  name: string;
  href: string;
  icon: typeof HomeIcon;
  module: string;
  match?: string[];
};

const menuItems: MenuItem[] = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon, module: 'dashboard' },
  { name: 'Users', href: '/dashboard/users', icon: UsersIcon, module: 'users' },
  {
    name: 'Vendors',
    href: '/dashboard/vendors',
    icon: BuildingStorefrontIcon,
    module: 'vendors',
    match: ['/dashboard/vendors', '/vendors'],
  },
  { name: 'Orders', href: '/dashboard/orders', icon: ShoppingBagIcon, module: 'orders' },
  { name: 'Coupons', href: '/dashboard/coupons', icon: TicketIcon, module: 'coupons' },
];

type SidebarContextValue = {
  desktopOpen: boolean;
  mobileOpen: boolean;
  toggleDesktop: () => void;
  openMobile: () => void;
  closeMobile: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const value = useContext(SidebarContext);
  if (!value) {
    throw new Error('Sidebar components must be used within SidebarProvider');
  }
  return value;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) === '0') {
      setDesktopOpen(false);
    }
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleDesktop = () => {
    setDesktopOpen((open) => {
      const next = !open;
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  };

  return (
    <SidebarContext.Provider
      value={{
        desktopOpen,
        mobileOpen,
        toggleDesktop,
        openMobile: () => setMobileOpen(true),
        closeMobile: () => setMobileOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function SidebarMenuButton() {
  const { openMobile } = useSidebar();

  return (
    <button
      type="button"
      onClick={openMobile}
      className="rounded-lg p-2 text-[#5F22D9] hover:bg-[#5F22D9]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5F22D9]/30 lg:hidden"
      aria-label="Open menu"
    >
      <Bars3Icon className="h-6 w-6" />
    </button>
  );
}

function isItemActive(pathname: string, item: MenuItem) {
  const paths = item.match ?? [item.href];
  return paths.some((href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(`${href}/`);
  });
}

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/dashboard" onClick={onClick} className="flex items-center">
      <Image
        src="/images/plenti-logo.png"
        alt="Plenti"
        width={50}
        height={50}
        className="h-6 w-auto object-contain"
      />
    </Link>
  );
}

function NavList({
  items,
  pathname,
  compact,
  onNavigate,
}: {
  items: MenuItem[];
  pathname: string;
  compact: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 px-2">
      {items.map((item) => {
        const active = isItemActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            title={compact ? item.name : undefined}
            aria-current={active ? 'page' : undefined}
            onClick={onNavigate}
            className={`flex items-center rounded-xl py-2.5 text-sm font-medium transition-colors ${
              compact ? 'justify-center px-2' : 'gap-3 px-3'
            } ${
              active
                ? 'bg-white text-[#5F22D9]'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!compact && <span className="truncate">{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { permissions } = useMyPermissions();
  const { desktopOpen, mobileOpen, toggleDesktop, closeMobile } = useSidebar();

  const visibleItems = menuItems.filter((item) => hasModuleAccess(permissions, item.module));

  return (
    <>
      <Dialog open={mobileOpen} onClose={closeMobile} className="relative z-50 lg:hidden">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/30 transition-opacity duration-300 ease-out data-[closed]:opacity-0"
        />
        <div className="fixed inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full pr-10">
            <DialogPanel
              transition
              className="pointer-events-auto flex h-full w-[280px] flex-col bg-[#5F22D9] shadow-xl transition duration-300 ease-out data-[closed]:-translate-x-full"
            >
              <div className="flex h-16 shrink-0 items-center justify-between px-4">
                <Logo onClick={closeMobile} />
                <button
                  type="button"
                  onClick={closeMobile}
                  className="rounded-lg p-2 text-white hover:bg-white/10 focus:outline-none"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <NavList items={visibleItems} pathname={pathname} compact={false} onNavigate={closeMobile} />
            </DialogPanel>
          </div>
        </div>
      </Dialog>

      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col overflow-y-auto overflow-x-hidden bg-[#5F22D9] transition-[width] duration-200 ease-out lg:flex ${
          desktopOpen ? 'w-60' : 'w-16'
        }`}
      >
        <div className={`flex h-16 shrink-0 items-center ${desktopOpen ? 'gap-2 px-3' : 'justify-center'}`}>
          <button
            type="button"
            onClick={toggleDesktop}
            className="rounded-lg p-2 text-white hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label={desktopOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={desktopOpen}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          {desktopOpen && <Logo />}
        </div>
        <NavList items={visibleItems} pathname={pathname} compact={!desktopOpen} />
      </aside>
    </>
  );
}
