'use client';

import { useState, useEffect } from 'react';
import { AdvancedAnalyticsSubscription } from '../types';

export const useAdvancedAnalytics = (tenantId: string) => {
  const [subscription, setSubscription] =
    useState<AdvancedAnalyticsSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/advanced-analytics/subscription?tenant_id=${tenantId}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch subscription');
        }

        const data = await response.json();
        setSubscription(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An error occurred'
        );
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchSubscription();
    }
  }, [tenantId]);

  const isEnabled = subscription && subscription.status === 'active';

  return {
    subscription,
    isEnabled,
    loading,
    error,
  };
};
