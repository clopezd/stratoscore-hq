'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ClaudeAnalysisResult } from '../types';

interface ClaudeInsightsProps {
  tenantId: string;
  onAnalysis?: (result: ClaudeAnalysisResult) => void;
}

export const ClaudeInsights: React.FC<ClaudeInsightsProps> = ({
  tenantId,
  onAnalysis,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClaudeAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [result]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      setError('Please enter a question or analysis request');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/advanced-analytics/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          query,
          data_source: 'power_bi',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze data');
      }

      const data: ClaudeAnalysisResult = await response.json();
      setResult(data);
      onAnalysis?.(data);
      setQuery('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Results */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {result && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Analysis</h3>
            <p className="text-blue-800 mb-4">{result.analysis}</p>

            {result.insights.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Key Insights</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.insights.map((insight, i) => (
                    <li key={i} className="text-blue-700">
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">
                  Recommendations
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-blue-700">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="border-t border-gray-200 p-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Claude to analyze your data..."
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </form>
    </div>
  );
};
