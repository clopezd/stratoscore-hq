import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import {
  ClaudeInsights,
  PowerBiDashboard,
  ReportGenerator,
  useAdvancedAnalytics,
} from '@/features/advanced-analytics';

export const metadata: Metadata = {
  title: 'Advanced Analytics | StratosCore',
  description: 'AI-powered business intelligence with Power BI and Claude',
};

export default async function AdvancedAnalyticsPage() {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  if (!userProfile) {
    redirect('/login');
  }

  const { data: subscription } = await supabase
    .from('advanced_analytics_subscriptions')
    .select('*')
    .eq('tenant_id', userProfile.tenant_id)
    .single();

  if (!subscription || subscription.status !== 'active') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">
            Advanced Analytics
          </h1>
          <p className="text-gray-600 mb-6">
            Unlock the power of AI-driven insights with Power BI integration
            and Claude AI analysis.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                📊 Power BI
              </h3>
              <p className="text-sm text-blue-700">
                Interactive dashboards
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">
                🤖 Claude AI
              </h3>
              <p className="text-sm text-purple-700">
                Intelligent analysis
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">
                📈 Reports
              </h3>
              <p className="text-sm text-green-700">
                Automated generation
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <p className="text-yellow-900">
              ⚠️ Advanced Analytics is not enabled for your account.
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              Contact your administrator to enable this premium feature.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Plans</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-900">Pro</p>
                <p className="text-2xl font-bold text-blue-600">$99</p>
                <p className="text-sm text-gray-600">/month</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="font-semibold text-gray-900">Enterprise</p>
                <p className="text-2xl font-bold text-indigo-600">Custom</p>
                <p className="text-sm text-gray-600">Contact us</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Advanced Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            AI-powered business intelligence with Power BI and Claude
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Power BI Dashboard */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              Power BI Dashboard
            </h2>
            <div className="bg-white rounded-lg shadow p-6 min-h-[400px]">
              <PowerBiDashboard
                config={{
                  workspace_id:
                    subscription.power_bi_workspace_id || '',
                  report_ids:
                    subscription.power_bi_report_ids || [],
                  tenant_id: userProfile.tenant_id,
                }}
                reportId="default"
              />
            </div>
          </div>

          {/* Claude Insights */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              AI Analysis
            </h2>
            <div className="bg-white rounded-lg shadow p-6 h-[500px]">
              <ClaudeInsights
                tenantId={userProfile.tenant_id}
              />
            </div>
          </div>

          {/* Report Generator */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Automated Reports
            </h2>
            <div className="bg-white rounded-lg shadow p-6">
              <ReportGenerator
                tenantId={userProfile.tenant_id}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
