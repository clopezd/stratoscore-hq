// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  // mcpServer deshabilitado: causaba que código de test (node:async_hooks)
  // se incluyera en el bundle del Edge Middleware, rompiendo producción.
  // experimental: { mcpServer: true },
  // turbopack.root eliminado: activaba Turbopack en producción y su runtime
  // inyectaba __dirname, no disponible en Edge Runtime.
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
