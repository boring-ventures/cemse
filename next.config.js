/** @type {import('next').NextConfig} */
const nextConfig = {
  // Deshabilitar ESLint durante el build para evitar errores
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Deshabilitar TypeScript checking durante el build (opcional)
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_USE_BACKEND: "true",
    NEXT_PUBLIC_BACKEND_URL: "https://cemse-back-production.up.railway.app",
  },
  // Ensure proper URL resolution
  basePath: "",
  assetPrefix: "",
  images: {
    domains: [
      // Add your Supabase project domain
      "swfgvfhpmicwptupjyko.supabase.co",
      "xqakfzhkeiongvzgbhji.supabase.co",
      "example.com",
      "img.youtube.com",
      "placehold.co",
      "localhost",
      "192.168.0.87",
      "cemse-back-production.up.railway.app",
      "bucket-production-1a58.up.railway.app",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "example.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
      },
      {
        protocol: "http",
        hostname: "192.168.10.91",
        port: "3001",
      },
      {
        protocol: "https",
        hostname: "cemse-back-production.up.railway.app",
      },
      {
        protocol: "https",
        hostname: "bucket-production-1a58.up.railway.app",
      },
    ],
  },
  output: "standalone",
  // Security headers configuration
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://cemse-back-production.up.railway.app https://bucket-production-1a58.up.railway.app http://localhost:9000 http://127.0.0.1:9000; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https://*.supabase.co https://* https://cemse-back-production.up.railway.app https://bucket-production-1a58.up.railway.app blob:; media-src *; font-src 'self' data:; frame-src 'self' https://js.stripe.com https://www.youtube.com https://youtube.com; object-src 'none'",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        // Special headers for service worker
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
        ],
      },
      {
        // Headers for API routes
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
  // ... other config options
};

module.exports = nextConfig;
