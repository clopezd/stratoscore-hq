import { useState, useEffect } from 'react'

// Stub temporal para Finance OS
export function useAdminConfig() {
  const [config, setConfig] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(false)

  return {
    config,
    loading,
    updateConfig: (key: string, value: unknown) => {
      setConfig((prev) => ({ ...prev, [key]: value }))
    },
  }
}
