'use client';
import { useCallback, useEffect, useState, type ComponentType, type SVGProps } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCardIcon,
  DocumentTextIcon,
  TicketIcon,
} from '@heroicons/react/24/outline';
import axiosClient from '../../../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';
import { useMyPermissions } from '@/hooks/useMyPermissions';
import { hasPermission } from '@/utils/permissions';
import Can from '@/components/common/Can';
import ApprovalBottomSheet from './ApprovalBottomSheet';
import BankAccountRequestList from './BankAccountRequestList';
import CatalogueRequestList from './CatalogueRequestList';
import DineinCouponRequestList from './DineinCouponRequestList';
import {
  APPROVAL_PAGE_SIZE,
  type ApprovalSheetKind,
  type BankAccountDetail,
  type CatalogueRequest,
  type DineinCouponRequest,
} from './types';

const SHEET_TITLES: Record<ApprovalSheetKind, string> = {
  catalogue: 'Catalogue requests',
  bank: 'Bank account details',
  dinein: 'Dine-in coupon requests',
};

type Tile = {
  id: ApprovalSheetKind;
  title: string;
  description: string;
  permission: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const TILES: Tile[] = [
  {
    id: 'catalogue',
    title: 'Catalogue',
    description: 'Review vendor catalogue update requests',
    permission: 'catalogue:read',
    icon: DocumentTextIcon,
  },
  {
    id: 'bank',
    title: 'Bank accounts',
    description: 'Review pending vendor bank account details',
    permission: 'vendors:bank_account',
    icon: CreditCardIcon,
  },
  {
    id: 'dinein',
    title: 'Dine-in coupons',
    description: 'Approve partner dine-in coupon offers',
    permission: 'dinein_coupon:read',
    icon: TicketIcon,
  },
];

export default function VendorApprovals() {
  const router = useRouter();
  const { permissions } = useMyPermissions();
  const [sheet, setSheet] = useState<ApprovalSheetKind | null>(null);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catalogueRequests, setCatalogueRequests] = useState<CatalogueRequest[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccountDetail[]>([]);
  const [dineinRequests, setDineinRequests] = useState<DineinCouponRequest[]>([]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchRequests = useCallback(async (kind: ApprovalSheetKind, offset: number) => {
    setLoading(true);
    setError(null);
    try {
      if (kind === 'catalogue') {
        const url = buildApiUrl('/v1/superuser/catalogue/request/get', {
          skip: offset,
          limit: APPROVAL_PAGE_SIZE,
        });
        const response = await axiosClient.get<CatalogueRequest[]>(url);
        setCatalogueRequests(response.data || []);
      } else if (kind === 'bank') {
        const url = buildApiUrl('/v1/superuser/vendor/account-details/get', {
          skip: offset,
          limit: APPROVAL_PAGE_SIZE,
        });
        const response = await axiosClient.post<BankAccountDetail[]>(url);
        setBankAccounts(response.data || []);
      } else {
        const url = buildApiUrl('/v1/superuser/dinein-coupon/request/get', {
          skip: offset,
          limit: APPROVAL_PAGE_SIZE,
        });
        const response = await axiosClient.get<DineinCouponRequest[]>(url);
        setDineinRequests(response.data || []);
      }
    } catch (err: unknown) {
      logger.error('Error fetching approval requests:', err);
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      setError(detail || 'Failed to fetch pending requests');
      setCatalogueRequests([]);
      setBankAccounts([]);
      setDineinRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sheet) return;
    fetchRequests(sheet, skip);
  }, [sheet, skip, fetchRequests]);

  const openSheet = (kind: ApprovalSheetKind) => {
    setSkip(0);
    setSheet(kind);
  };

  const closeSheet = () => {
    setSheet(null);
    setError(null);
  };

  const handleVerifyDinein = async (couponId: string, approved: boolean) => {
    try {
      setVerifyingId(couponId);
      await axiosClient.post(buildApiUrl('/v1/superuser/dinein-coupon/request/verify'), {
        coupon_id: couponId,
        approved,
      });
      if (sheet === 'dinein') {
        await fetchRequests('dinein', skip);
      }
    } catch (err: unknown) {
      logger.error('Error verifying dine-in coupon:', err);
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      setError(detail || 'Failed to update dine-in coupon');
    } finally {
      setVerifyingId(null);
    }
  };

  const visibleTiles = TILES.filter((tile) => hasPermission(permissions, tile.permission));
  if (visibleTiles.length === 0) return null;

  return (
    <div className="glass-card space-y-3 rounded-xl p-4">
      <div>
        <h2 className="text-sm font-semibold text-gray-900">Approvals</h2>
        <p className="mt-0.5 text-xs text-gray-500">Review pending requests</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {TILES.map((tile) => (
          <Can key={tile.id} permissions={permissions} permission={tile.permission}>
            <button
              type="button"
              onClick={() => openSheet(tile.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <tile.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-gray-900">{tile.title}</span>
                <span className="mt-0.5 block truncate text-xs text-gray-500">{tile.description}</span>
              </span>
            </button>
          </Can>
        ))}
      </div>

      <ApprovalBottomSheet
        isOpen={sheet !== null}
        title={sheet ? SHEET_TITLES[sheet] : ''}
        onClose={closeSheet}
      >
        {sheet === 'catalogue' ? (
          <CatalogueRequestList
            requests={catalogueRequests}
            loading={loading}
            error={error}
            skip={skip}
            onPrevious={() => setSkip((prev) => Math.max(0, prev - APPROVAL_PAGE_SIZE))}
            onNext={() => setSkip((prev) => prev + APPROVAL_PAGE_SIZE)}
            onSelect={(requestId) => {
              closeSheet();
              router.push(`/dashboard/vendors/catalogue-requests/${requestId}`);
            }}
          />
        ) : null}
        {sheet === 'bank' ? (
          <BankAccountRequestList
            accounts={bankAccounts}
            loading={loading}
            error={error}
            skip={skip}
            onPrevious={() => setSkip((prev) => Math.max(0, prev - APPROVAL_PAGE_SIZE))}
            onNext={() => setSkip((prev) => prev + APPROVAL_PAGE_SIZE)}
            onSelect={(vendorId) => {
              closeSheet();
              router.push(`/dashboard/vendors/bank-accounts/${vendorId}`);
            }}
          />
        ) : null}
        {sheet === 'dinein' ? (
          <DineinCouponRequestList
            requests={dineinRequests}
            loading={loading}
            error={error}
            skip={skip}
            verifyingId={verifyingId}
            permissions={permissions}
            onPrevious={() => setSkip((prev) => Math.max(0, prev - APPROVAL_PAGE_SIZE))}
            onNext={() => setSkip((prev) => prev + APPROVAL_PAGE_SIZE)}
            onVerify={handleVerifyDinein}
          />
        ) : null}
      </ApprovalBottomSheet>
    </div>
  );
}
