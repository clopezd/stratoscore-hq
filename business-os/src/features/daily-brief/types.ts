export type ClientId = 'videndum' | 'mobility' | 'bidhunter' | 'finanzas'

export const CLIENT_LABELS: Record<ClientId, string> = {
  videndum: 'Videndum',
  mobility: 'Mobility',
  bidhunter: 'BidHunter',
  finanzas: 'Finanzas',
}

export const CLIENT_EMOJIS: Record<ClientId, string> = {
  videndum: '🎯',
  mobility: '🏥',
  bidhunter: '🔨',
  finanzas: '💰',
}

// Path globs that identify which client a commit/file belongs to.
// Order matters: the matcher returns the first match.
export const CLIENT_PATHS: Record<ClientId, string[]> = {
  videndum: ['src/features/videndum/', 'src/app/(main)/videndum/', 'src/app/api/videndum/', 'docs/videndum/'],
  mobility: ['src/features/mobility/', 'src/app/mobility/', 'src/app/api/mobility/'],
  bidhunter: ['src/features/bidhunter/', 'src/app/bidhunter/', 'src/app/api/bidhunter/', 'chrome-extension/'],
  finanzas: ['src/features/finances/', 'src/app/(main)/finanzas/', 'src/app/api/finance/', 'src/app/api/finances/', 'src/features/finance-agent/'],
}

export const ALL_CLIENTS: ClientId[] = ['videndum', 'mobility', 'bidhunter', 'finanzas']

export interface PRDStatus {
  exists: boolean
  client: ClientId
  objective: string | null
  total: number
  done: number
  pending: string[]   // first N pending items, full text
  pct: number         // 0..100, rounded
}

export interface CommitInfo {
  hash: string
  subject: string
  files: string[]
}

export interface ClientActivity {
  client: ClientId
  commits: CommitInfo[]
  pipelineActions: number  // bidhunter only
}

export interface ClientBrief {
  client: ClientId
  prd: PRDStatus
  activity: ClientActivity
}
