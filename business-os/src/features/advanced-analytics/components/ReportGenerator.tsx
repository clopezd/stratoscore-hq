'use client';

import React, { useState } from 'react';
import { AutomatedReport } from '../types';

interface ReportGeneratorProps {
  tenantId: string;
  onReportGenerated?: (report: AutomatedReport) => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  tenantId,
  onReportGenerated,
}) => {
  const [reports, setReports] = useState<AutomatedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    frequency: 'weekly' as const,
    template: 'sales' as const,
  });

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        '/api/advanced-analytics/reports',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: tenantId,
            ...formData,
            enabled: true,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to create report');

      const newReport: AutomatedReport = await response.json();
      setReports([...reports, newReport]);
      onReportGenerated?.(newReport);
      setFormData({ name: '', frequency: 'weekly', template: 'sales' });
      setShowForm(false);
    } catch (error) {
      console.error('Error creating report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Automated Reports</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          New Report
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateReport} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Report Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      frequency: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Template
                </label>
                <select
                  value={formData.template}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      template: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="sales">Sales</option>
                  <option value="operations">Operations</option>
                  <option value="finance">Finance</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Report'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {reports.length === 0 ? (
          <p className="text-gray-500">No automated reports configured yet</p>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">{report.name}</p>
                <p className="text-sm text-gray-600">
                  {report.frequency} • {report.template} template
                </p>
              </div>
              <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                {report.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
