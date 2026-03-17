'use client'

import type { ActivityItem } from '../types'

interface ActivityFeedProps {
  activities: ActivityItem[]
}

const SEVERITY_COLORS = {
  info: 'text-blue-400',
  success: 'text-green-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities.length) {
    return (
      <div className="text-center py-12 text-white/30 text-sm">
        No hay actividad reciente
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="group flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200"
        >
          <div className="text-lg flex-shrink-0 mt-0.5">{activity.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-white/90">{activity.client_name}</span>
              <span className="text-xs text-white/30">·</span>
              <span className="text-xs text-white/40">{formatRelativeTime(activity.created_at)}</span>
            </div>
            <p className={`text-sm mt-0.5 ${SEVERITY_COLORS[activity.severity]}`}>
              {activity.action}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'ahora'
  if (diffMins < 60) return `hace ${diffMins}m`
  if (diffHours < 24) return `hace ${diffHours}h`
  return `hace ${diffDays}d`
}
