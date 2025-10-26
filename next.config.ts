// next.config.js
const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/profile',       // ให้ Next.js จัด folder /profile/ ให้เลย
  assetPrefix: '/profile/',
  images: { unoptimized: true },

  webpack: (config: { resolve: { fallback: any; alias: any }; experiments: any }, { isServer }: any) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
      config.resolve.alias = {
        ...config.resolve.alias,
        'onnxruntime-node$': false,
        'sharp$': false,
      }
    }
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
    }
    return config
  },
}

export default nextConfig
