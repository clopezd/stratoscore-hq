/**
 * Activity sources for daily brief:
 * - getCommitsForClient: GitHub REST API (works on Vercel without git CLI)
 * - getPipelineActionsForClient: Supabase bh_pipeline_log (BidHunter only)
 *
 * Repo + token via env: DAILY_BRIEF_REPO (default clopezd/stratoscore-hq), GITHUB_TOKEN.
 */
import { createClient } from '@supabase/supabase-js'
import { CLIENT_PATHS, type ClientId, type CommitInfo } from '../types'

const REPO = process.env.DAILY_BRIEF_REPO || 'clopezd/stratoscore-hq'
const GH_TOKEN = process.env.GITHUB_TOKEN || ''

function ghHeaders(): HeadersInit {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (GH_TOKEN) h.Authorization = `Bearer ${GH_TOKEN}`
  return h
}

interface GhCommit {
  sha: string
  commit: { message: string }
}

interface GhCommitDetail {
  sha: string
  commit: { message: string }
  files?: { filename: string }[]
}

/**
 * Fetch commits between since and until (ISO strings) from the configured branch.
 * Returns parsed CommitInfo[] including filenames so we can route by client.
 */
export async function getCommitsInRange(since: string, until: string, branch = 'main'): Promise<CommitInfo[]> {
  const url = new URL(`https://api.github.com/repos/${REPO}/commits`)
  url.searchParams.set('since', since)
  url.searchParams.set('until', until)
  url.searchParams.set('sha', branch)
  url.searchParams.set('per_page', '100')

  const res = await fetch(url.toString(), { headers: ghHeaders() })
  if (!res.ok) {
    throw new Error(`GitHub commits fetch failed: ${res.status} ${await res.text()}`)
  }
  const list = (await res.json()) as GhCommit[]

  // For each commit, fetch detail to get the file list (paths).
  const detailed = await Promise.all(
    list.map(async (c) => {
      const dRes = await fetch(`https://api.github.com/repos/${REPO}/commits/${c.sha}`, { headers: ghHeaders() })
      if (!dRes.ok) return { hash: c.sha, subject: c.commit.message.split('\n')[0], files: [] }
      const d = (await dRes.json()) as GhCommitDetail
      return {
        hash: c.sha.slice(0, 7),
        subject: d.commit.message.split('\n')[0],
        files: (d.files || []).map((f) => f.filename),
      }
    }),
  )
  return detailed
}

/**
 * Filter commits whose changed files match any path prefix for the given client.
 * The repo is a monorepo and clients live under business-os/, so we strip that prefix
 * before matching against CLIENT_PATHS.
 */
export function filterCommitsByClient(commits: CommitInfo[], client: ClientId): CommitInfo[] {
  const prefixes = CLIENT_PATHS[client]
  return commits.filter((c) =>
    c.files.some((f) => {
      const stripped = f.startsWith('business-os/') ? f.slice('business-os/'.length) : f
      return prefixes.some((p) => stripped.startsWith(p) || f.startsWith(p))
    }),
  )
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}

/**
 * Count BidHunter pipeline actions in the time window.
 * Returns 0 for non-bidhunter clients.
 */
export async function getPipelineActionsForClient(client: ClientId, since: string, until: string): Promise<number> {
  if (client !== 'bidhunter') return 0
  try {
    const supabase = getAdminClient()
    const { count, error } = await supabase
      .from('bh_pipeline_log')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since)
      .lt('created_at', until)
    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}
