import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  ClaudeInsights,
  PowerBiDashboard,
  ReportGenerator,
} from '@/features/advanced-analytics';
import { VIDENDUM_BRAND } from '@/features/videndum/brand';

export const metadata: Metadata = {
  title: 'Advanced Insights | Videndum',
  description:
    'AI-powered forecast analysis and production planning insights',
};

export default async function VidendumAdvancedInsightsPage() {
  const supabase = await createClient();

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
      <div
        className="min-h-screen p-8"
        style={{
          backgroundColor: '#F8F8F8',
        }}
      >
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 border border-gray-200">
          <h1
            className="text-3xl font-semibold mb-4"
            style={{ color: VIDENDUM_BRAND.colors.black }}
          >
            Advanced Insights
          </h1>
          <p
            className="mb-6"
            style={{ color: VIDENDUM_BRAND.colors.darkGray }}
          >
            Unlock AI-powered analysis for forecast accuracy, SKU-level
            insights, and production planning optimization.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: '#F8F8F8',
                borderColor: VIDENDUM_BRAND.colors.lightGray,
              }}
            >
              <p
                className="font-semibold mb-1"
                style={{ color: VIDENDUM_BRAND.colors.black }}
              >
                📊 Analytics
              </p>
              <p
                className="text-sm"
                style={{
                  color: VIDENDUM_BRAND.colors.darkGray,
                }}
              >
                Forecast vs Real
              </p>
            </div>

            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: '#F8F8F8',
                borderColor: VIDENDUM_BRAND.colors.lightGray,
              }}
            >
              <p
                className="font-semibold mb-1"
                style={{ color: VIDENDUM_BRAND.colors.black }}
              >
                🤖 Claude AI
              </p>
              <p
                className="text-sm"
                style={{
                  color: VIDENDUM_BRAND.colors.darkGray,
                }}
              >
                Intelligent analysis
              </p>
            </div>

            <div
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: '#F8F8F8',
                borderColor: VIDENDUM_BRAND.colors.lightGray,
              }}
            >
              <p
                className="font-semibold mb-1"
                style={{ color: VIDENDUM_BRAND.colors.black }}
              >
                📈 Reports
              </p>
              <p
                className="text-sm"
                style={{
                  color: VIDENDUM_BRAND.colors.darkGray,
                }}
              >
                Weekly automation
              </p>
            </div>
          </div>

          <div
            className="border rounded-lg p-6 mb-8"
            style={{
              backgroundColor: '#FFFBEA',
              borderColor: '#F59E0B',
            }}
          >
            <p
              style={{
                color: VIDENDUM_BRAND.colors.black,
              }}
            >
              ⚠️ Advanced Insights is not yet enabled for your workspace.
            </p>
            <p
              className="text-sm mt-2"
              style={{
                color: VIDENDUM_BRAND.colors.darkGray,
              }}
            >
              Contact your account manager to activate this premium feature for
              enhanced forecast analysis and production planning.
            </p>
          </div>

          <div>
            <h3
              className="font-semibold mb-3"
              style={{ color: VIDENDUM_BRAND.colors.black }}
            >
              Pricing
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div
                className="p-4 border rounded-lg"
                style={{
                  borderColor: VIDENDUM_BRAND.colors.midGray,
                }}
              >
                <p
                  className="font-semibold"
                  style={{ color: VIDENDUM_BRAND.colors.black }}
                >
                  Pro
                </p>
                <p className="text-2xl font-bold mb-1">$99</p>
                <p
                  className="text-sm"
                  style={{
                    color: VIDENDUM_BRAND.colors.darkGray,
                  }}
                >
                  /month
                </p>
              </div>

              <div
                className="p-4 border rounded-lg"
                style={{
                  borderColor: VIDENDUM_BRAND.colors.midGray,
                }}
              >
                <p
                  className="font-semibold"
                  style={{ color: VIDENDUM_BRAND.colors.black }}
                >
                  Enterprise
                </p>
                <p className="text-2xl font-bold mb-1">Custom</p>
                <p
                  className="text-sm"
                  style={{
                    color: VIDENDUM_BRAND.colors.darkGray,
                  }}
                >
                  Contact sales
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-8"
      style={{
        backgroundColor: '#F8F8F8',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold"
            style={{ color: VIDENDUM_BRAND.colors.black }}
          >
            Advanced Insights
          </h1>
          <p
            className="mt-2"
            style={{
              color: VIDENDUM_BRAND.colors.darkGray,
            }}
          >
            AI-powered forecast analysis and production planning
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Analytics Dashboard */}
          <div className="lg:col-span-2">
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: VIDENDUM_BRAND.colors.black }}
            >
              Forecast Analytics
            </h2>
            <div
              className="bg-white rounded-lg shadow p-6 min-h-[400px] border"
              style={{
                borderColor: VIDENDUM_BRAND.colors.lightGray,
              }}
            >
              <PowerBiDashboard
                config={{
                  workspace_id:
                    subscription.power_bi_workspace_id || '',
                  report_ids:
                    subscription.power_bi_report_ids || [],
                  tenant_id: userProfile.tenant_id,
                }}
                reportId="videndum-forecast"
              />
              <div className="mt-4 text-center">
                <p
                  className="text-sm"
                  style={{
                    color: VIDENDUM_BRAND.colors.midGray,
                  }}
                >
                  Connect your Power BI workspace to visualize forecast vs
                  actual performance
                </p>
              </div>
            </div>
          </div>

          {/* Claude Analysis */}
          <div>
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: VIDENDUM_BRAND.colors.black }}
            >
              Ask Claude
            </h2>
            <div
              className="bg-white rounded-lg shadow p-6 h-[500px] border"
              style={{
                borderColor: VIDENDUM_BRAND.colors.lightGray,
              }}
            >
              <ClaudeInsights
                tenantId={userProfile.tenant_id}
                onAnalysis={(result) => {
                  console.log('Analysis result:', result);
                }}
              />
            </div>
            <div className="mt-3">
              <p
                className="text-xs"
                style={{
                  color: VIDENDUM_BRAND.colors.midGray,
                }}
              >
                <strong>Example questions:</strong>
              </p>
              <ul
                className="text-xs mt-1 space-y-1"
                style={{
                  color: VIDENDUM_BRAND.colors.darkGray,
                }}
              >
                <li>
                  • "Which SKUs have the highest forecast variance this week?"
                </li>
                <li>
                  • "Analyze risk for production shortage in the next 30 days"
                </li>
                <li>
                  • "Which products need inventory adjustment?"
                </li>
              </ul>
            </div>
          </div>

          {/* Automated Reports */}
          <div>
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: VIDENDUM_BRAND.colors.black }}
            >
              Weekly Reports
            </h2>
            <div
              className="bg-white rounded-lg shadow p-6 border"
              style={{
                borderColor: VIDENDUM_BRAND.colors.lightGray,
              }}
            >
              <ReportGenerator
                tenantId={userProfile.tenant_id}
                onReportGenerated={(report) => {
                  console.log('Report created:', report);
                }}
              />
            </div>
            <div className="mt-3">
              <p
                className="text-xs"
                style={{
                  color: VIDENDUM_BRAND.colors.midGray,
                }}
              >
                Automated weekly forecast vs actual analysis reports
              </p>
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div className="mt-12 grid grid-cols-3 gap-6">
          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: '#F8F8F8',
              borderColor: VIDENDUM_BRAND.colors.lightGray,
            }}
          >
            <p
              className="text-sm font-semibold mb-2"
              style={{ color: VIDENDUM_BRAND.colors.black }}
            >
              SKU-Level Analysis
            </p>
            <p
              className="text-xs"
              style={{
                color: VIDENDUM_BRAND.colors.darkGray,
              }}
            >
              Deep dive into individual product performance and variance
            </p>
          </div>

          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: '#F8F8F8',
              borderColor: VIDENDUM_BRAND.colors.lightGray,
            }}
          >
            <p
              className="text-sm font-semibold mb-2"
              style={{ color: VIDENDUM_BRAND.colors.black }}
            >
              Risk Alerts
            </p>
            <p
              className="text-xs"
              style={{
                color: VIDENDUM_BRAND.colors.darkGray,
              }}
            >
              Proactive identification of potential shortages and overstock
            </p>
          </div>

          <div
            className="p-6 rounded-lg border"
            style={{
              backgroundColor: '#F8F8F8',
              borderColor: VIDENDUM_BRAND.colors.lightGray,
            }}
          >
            <p
              className="text-sm font-semibold mb-2"
              style={{ color: VIDENDUM_BRAND.colors.black }}
            >
              Recommendations
            </p>
            <p
              className="text-xs"
              style={{
                color: VIDENDUM_BRAND.colors.darkGray,
              }}
            >
              AI-driven suggestions for production planning and inventory
              adjustment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
