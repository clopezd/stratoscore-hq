'use client';

import React, { useEffect, useState } from 'react';
import { PowerBiConfig } from '../types';

interface PowerBiDashboardProps {
  config: PowerBiConfig;
  reportId: string;
}

export const PowerBiDashboard: React.FC<PowerBiDashboardProps> = ({
  config,
  reportId,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPowerBi = async () => {
      try {
        setLoading(true);
        // PowerBI embed SDK would be loaded here
        // For now, we'll set up the container
      } catch (err) {
        setError('Failed to load Power BI dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPowerBi();
  }, [config, reportId]);

  if (loading) {
    return <div className="p-8 text-center">Loading Power BI Dashboard...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  return (
    <div
      id={`powerbi-container-${reportId}`}
      className="w-full h-full bg-gray-50 rounded-lg border border-gray-200"
      data-report-id={reportId}
    >
      {/* Power BI report embed goes here */}
      <div className="p-8 text-gray-500">
        Power BI Report: {reportId}
      </div>
    </div>
  );
};
