/**
 * Parses business-os/docs/prds/{client}.md.
 * Counts checklist items, extracts the Objective paragraph.
 */
import fs from 'fs'
import path from 'path'
import type { ClientId, PRDStatus } from '../types'

function prdPath(client: ClientId): string {
  // Resolved relative to the Next.js project root (cwd at runtime).
  return path.join(process.cwd(), 'docs', 'prds', `${client}.md`)
}

function extractObjective(md: string): string | null {
  const m = md.match(/##\s+Objetivo\s*\n+([\s\S]*?)(?=\n##\s|\n$)/i)
  if (!m) return null
  return m[1].trim() || null
}

export function parsePRD(client: ClientId): PRDStatus {
  const file = prdPath(client)
  if (!fs.existsSync(file)) {
    return { exists: false, client, objective: null, total: 0, done: 0, pending: [], pct: 0 }
  }

  const md = fs.readFileSync(file, 'utf-8')

  // GFM checklists: "- [ ]" or "- [x]" (case-insensitive on the x)
  const doneRe = /^\s*-\s*\[x\]\s+(.+)$/gim
  const pendingRe = /^\s*-\s*\[ \]\s+(.+)$/gim

  const done = (md.match(doneRe) || []).length
  const pendingItems: string[] = []
  let pm: RegExpExecArray | null
  while ((pm = pendingRe.exec(md)) !== null) {
    pendingItems.push(pm[1].trim())
  }

  const total = done + pendingItems.length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return {
    exists: true,
    client,
    objective: extractObjective(md),
    total,
    done,
    pending: pendingItems,
    pct,
  }
}
