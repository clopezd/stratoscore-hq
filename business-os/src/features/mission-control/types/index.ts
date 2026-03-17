export interface Client {
  id: string
  name: string
  tagline: string
  logo_url: string | null
  status: 'active' | 'paused' | 'archived'
  dashboard_url: string
  primary_metric_label: string | null
  primary_metric_value: string | null
  secondary_metric_label: string | null
  secondary_metric_value: string | null
  alerts_count: number
  tasks_count: number
  last_activity_action: string | null
  last_activity_timestamp: string | null
  brand_color: string
}

export interface ActivityItem {
  id: number
  client_id: string
  client_name: string
  action: string
  severity: 'info' | 'warning' | 'success' | 'error'
  icon: string
  created_at: string
}

export interface MissionControlData {
  clients: Client[]
  activities: ActivityItem[]
  stats: {
    totalClients: number
    activeClients: number
    totalTasks: number
    totalAlerts: number
  }
}
