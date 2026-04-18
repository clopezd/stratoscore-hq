export interface AdvancedAnalyticsSubscription {
  id: string;
  tenant_id: string;
  user_id: string;
  status: 'active' | 'paused' | 'cancelled';
  plan: 'pro' | 'enterprise';
  created_at: string;
  expires_at: string | null;
  power_bi_workspace_id: string | null;
  power_bi_report_ids: string[];
}

export interface AnalysisRequest {
  id: string;
  tenant_id: string;
  user_id: string;
  query: string;
  data_source: 'power_bi' | 'custom_data';
  created_at: string;
  analysis?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface PowerBiConfig {
  workspace_id: string;
  report_ids: string[];
  tenant_id: string;
  access_token?: string;
}

export interface ClaudeAnalysisResult {
  query: string;
  analysis: string;
  insights: string[];
  recommendations: string[];
  timestamp: string;
}

export interface AutomatedReport {
  id: string;
  tenant_id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  last_generated: string | null;
  next_scheduled: string;
  template: 'sales' | 'operations' | 'finance' | 'custom';
  enabled: boolean;
}
