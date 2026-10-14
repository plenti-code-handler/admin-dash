'use client';

import { useEffect, useState } from 'react';
import axiosClient from '../../../../AxiosClient';
import { buildApiUrl } from '@/config';
import { logger } from '@/utils/logger';
import { getApiErrorDetail } from '@/utils/apiError';
import CataloguePricingTable, { type Catalogue } from './CataloguePricingTable';

interface VendorCatalogueResponse {
  vendor_id: string;
  catalogue: Catalogue | null;
}

export default function VendorPricing({ vendorId }: { vendorId: string }) {
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCatalogue = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = buildApiUrl('/v1/superuser/catalogue/vendor/get', { vendor_id: vendorId });
        const response = await axiosClient.get<VendorCatalogueResponse>(url);
        if (!cancelled) {
          setCatalogue(response.data.catalogue);
        }
      } catch (err) {
        logger.error('Error fetching vendor catalogue:', err);
        if (!cancelled) {
          setError(getApiErrorDetail(err, 'Failed to load vendor catalogue'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (vendorId) fetchCatalogue();
    return () => {
      cancelled = true;
    };
  }, [vendorId]);

  if (loading) {
    return (
      <div className="glass-card flex items-center justify-center rounded-xl p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card rounded-xl p-6">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="glass-card rounded-xl p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Payout</h2>
        {catalogue?.payout ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">Tier</p>
              <p className="text-sm text-gray-900">{catalogue.payout.tier}</p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-700">Threshold</p>
              <p className="text-sm text-gray-900">₹{catalogue.payout.threshold}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No payout information</p>
        )}
      </section>

      <section className="glass-card rounded-xl p-4 sm:p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Pricing</h2>
        <CataloguePricingTable catalogue={catalogue} />
      </section>
    </div>
  );
}
