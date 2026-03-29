// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // mcpServer deshabilitado: causaba que código de test (node:async_hooks)
  // se incluyera en el bundle del Edge Middleware, rompiendo producción.
  // experimental: { mcpServer: true },
  // ssh2 uses native 'fs' — keep it out of the static bundle.
  // The import in calendar/route.ts is now dynamic, so this is a belt-and-suspenders guard.
  serverExternalPackages: ['ssh2', 'xlsx', 'xlsx-js-style'],

  // Optimizaciones de build
  experimental: {
    optimizePackageImports: ['recharts', 'lucide-react', 'date-fns'],
    // webpackBuildWorker: true, // Bug en WSL2 - deshabilitado temporalmente
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Reducir output tracing en WSL2
  // output: 'standalone', // Bug processChild.js en WSL2 - deshabilitado

  // Skip TypeScript check en build (stubs de Finance OS)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Skip ESLint check en build
  eslint: {
    ignoreDuringBuilds: true,
  },

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
