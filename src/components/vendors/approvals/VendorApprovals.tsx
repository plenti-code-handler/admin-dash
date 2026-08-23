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
    <div className="glass-card space-y-4 p-4 sm:p-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900 sm:text-lg">Approvals</h2>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Open a tile to review pending requests
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {TILES.map((tile) => (
          <Can key={tile.id} permissions={permissions} permission={tile.permission}>
            <button
              type="button"
              onClick={() => openSheet(tile.id)}
              className="flex w-full flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-200 hover:ring-2 hover:ring-indigo-100 sm:p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <tile.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{tile.title}</p>
                <p className="mt-1 text-xs text-gray-500">{tile.description}</p>
              </div>
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
