'use client';

import React, { useState } from 'react';
import { ClaudeInsights } from '@/features/advanced-analytics';
import { VIDENDUM_BRAND } from '../brand';

interface VidendumAdvancedInsightsProps {
  tenantId: string;
}

export const VidendumAdvancedInsights: React.FC<
  VidendumAdvancedInsightsProps
> = ({ tenantId }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    null
  );

  const templates = [
    {
      id: 'forecast-variance',
      title: 'Forecast Variance Analysis',
      description: 'Which SKUs have the highest variance vs forecast?',
      prompt:
        'Analyze our forecast vs actual sales data for the past 8 weeks. Which SKUs have the largest negative variance? What does this tell us about demand patterns? Recommend adjustments to our safety stock levels.',
    },
    {
      id: 'risk-assessment',
      title: 'Production Risk Assessment',
      description: 'Identify potential shortage or overstock risks',
      prompt:
        'Based on current inventory levels and forecast for the next 30 days, identify which SKUs are at risk of stockout. Which products have excess inventory? Recommend production plan adjustments.',
    },
    {
      id: 'seasonal-patterns',
      title: 'Seasonal Pattern Analysis',
      description: 'Identify seasonal trends in demand',
      prompt:
        'Analyze our historical sales data (2018-present) to identify seasonal patterns by product line. What are the peak and low seasons? How should we adjust our forecast for upcoming quarters?',
    },
    {
      id: 'order-book-impact',
      title: 'Order Book Impact',
      description: 'Forecast the impact of current order book on production',
      prompt:
        'Given our current order book and order intake, what is the impact on production scheduling for the next 7 weeks? Which products are bottlenecks? What are the component lead time implications?',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Templates */}
      <div>
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: VIDENDUM_BRAND.colors.black }}
        >
          Suggested Analysis Templates
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.prompt)}
              className="p-3 rounded-lg border text-left hover:opacity-80 transition-opacity"
              style={{
                borderColor: VIDENDUM_BRAND.colors.lightGray,
                backgroundColor: '#FAFAFA',
              }}
            >
              <p
                className="text-xs font-semibold"
                style={{ color: VIDENDUM_BRAND.colors.black }}
              >
                {template.title}
              </p>
              <p
                className="text-xs mt-1"
                style={{
                  color: VIDENDUM_BRAND.colors.midGray,
                }}
              >
                {template.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Claude Insights */}
      <div className="bg-white rounded-lg border p-6"
        style={{
          borderColor: VIDENDUM_BRAND.colors.lightGray,
        }}
      >
        <ClaudeInsights
          tenantId={tenantId}
          onAnalysis={(result) => {
            console.log('Analysis completed:', result);
            setSelectedTemplate(null);
          }}
        />
      </div>

      {/* Tips */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: '#F8F8F8',
          borderLeft: `4px solid ${VIDENDUM_BRAND.colors.darkGray}`,
        }}
      >
        <p
          className="text-xs font-semibold mb-2"
          style={{ color: VIDENDUM_BRAND.colors.black }}
        >
          💡 Tips for better analysis:
        </p>
        <ul
          className="text-xs space-y-1"
          style={{ color: VIDENDUM_BRAND.colors.darkGray }}
        >
          <li>• Be specific about date ranges and product lines</li>
          <li>• Ask about variance, risk, and recommendations</li>
          <li>• Use templates above as starting points</li>
          <li>• Request both SKU-level and category-level insights</li>
        </ul>
      </div>
    </div>
  );
};
