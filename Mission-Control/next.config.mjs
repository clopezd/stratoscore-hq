// @ts-check
import { fileURLToPath } from 'url'

// ESM-safe equivalent of __dirname — evaluated at build time only, never in Edge Runtime.
const projectRoot = fileURLToPath(new URL('.', import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Anchor Turbopack's workspace root to Mission-Control/ so it doesn't pick up
  // lockfiles from sibling monorepo packages (agent-server/, finance-os/) on Vercel,
  // which caused it to resolve the wrong root and inject __dirname into the edge bundle.
  turbopack: {
    root: projectRoot,
  },
  // mcpServer deshabilitado: causaba que código de test (node:async_hooks)
  // se incluyera en el bundle del Edge Middleware, rompiendo producción.
  // experimental: { mcpServer: true },
  // ssh2 uses native 'fs' — keep it out of the static bundle.
  // The import in calendar/route.ts is now dynamic, so this is a belt-and-suspenders guard.
  serverExternalPackages: ['ssh2'],
  // Allow images from Supabase Storage (generated images, avatars, etc.)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ]
  },
}

export default nextConfig
