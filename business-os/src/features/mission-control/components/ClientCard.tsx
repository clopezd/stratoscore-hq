'use client'

import Link from 'next/link'
import type { Client } from '../types'

interface ClientCardProps {
  client: Client
}

const STATUS_CONFIG = {
  active: { label: 'Active', color: '#22c55e', icon: '🟢' },
  paused: { label: 'Paused', color: '#eab308', icon: '🟡' },
  archived: { label: 'Archived', color: '#6b7280', icon: '⚫' },
}

export function ClientCard({ client }: ClientCardProps) {
  const status = STATUS_CONFIG[client.status]

  return (
    <Link href={client.dashboard_url}>
      <div
        className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
        style={{
          background: 'linear-gradient(135deg, rgba(19,19,31,0.95) 0%, rgba(19,19,31,0.85) 100%)',
          border: `1px solid rgba(255,255,255,0.08)`,
        }}
      >
        {/* Accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: client.brand_color }}
        />

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Logo */}
            {client.logo_url ? (
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 p-1.5 border border-white/10">
                <img
                  src={client.logo_url}
                  alt={`${client.name} logo`}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold"
                style={{
                  background: `${client.brand_color}20`,
                  color: client.brand_color
                }}
              >
                {client.name[0]}
              </div>
            )}

            {/* Name & tagline */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-opacity-90 transition-colors truncate">
                {client.name}
              </h3>
              <p className="text-xs text-white/50 line-clamp-1">{client.tagline}</p>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 flex-shrink-0">
            <span className="text-xs">{status.icon}</span>
            <span className="text-[10px] text-white/60 font-medium">{status.label}</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-3 mb-4">
          {client.primary_metric_label && (
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                {client.primary_metric_label}
              </p>
              <p className="text-xl font-bold" style={{ color: client.brand_color }}>
                {client.primary_metric_value}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs">
            {client.secondary_metric_label && (
              <div className="flex items-center gap-1.5">
                <span className="text-white/40">{client.secondary_metric_label}:</span>
                <span className="text-white/80 font-medium">{client.secondary_metric_value}</span>
              </div>
            )}
            {client.alerts_count > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-red-400">🔴</span>
                <span className="text-red-400 font-medium">{client.alerts_count}</span>
              </div>
            )}
          </div>
        </div>

        {/* Last activity */}
        {client.last_activity_action && (
          <div className="pt-3 border-t border-white/5">
            <p className="text-[10px] text-white/30 mb-0.5">Última actividad</p>
            <p className="text-xs text-white/60">{client.last_activity_action}</p>
            {client.last_activity_timestamp && (
              <p className="text-[10px] text-white/30 mt-1">
                {formatRelativeTime(client.last_activity_timestamp)}
              </p>
            )}
          </div>
        )}

        {/* Hover effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${client.brand_color}10 0%, transparent 100%)`,
          }}
        />

        {/* Arrow indicator */}
        <div className="absolute bottom-4 right-4 text-white/20 group-hover:text-white/40 transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10h12m0 0l-4-4m4 4l-4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Link>
  )
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `hace ${diffMins}m`
  if (diffHours < 24) return `hace ${diffHours}h`
  return `hace ${diffDays}d`
}
