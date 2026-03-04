/**
 * Returns true if the hostname starts with exactly 'lavanderia.'
 * This is the canonical check for the Lavandería subdomain.
 *
 * ✅  lavanderia.stratoscore.app
 * ✅  lavanderia.localhost (local dev)
 * ❌  lavanderia-logistica-xxx.vercel.app  (has dash, not dot)
 * ❌  www.lavanderia.stratoscore.app       (extra prefix)
 */
export function isLavanderiaSubdomain(host: string): boolean {
  return host.split(':')[0].startsWith('lavanderia.')
}
