/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  pageExtensions: [
    'page.tsx',
    'api.ts',
    'api.tsx'
  ]
}

module.exports = nextConfig
