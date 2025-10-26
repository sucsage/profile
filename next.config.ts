// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Export เป็น static HTML
  output: 'export',

  // ✅ ปิด dependencies ฝั่ง server ที่ใช้ไม่ได้ใน browser
  webpack: (config: { resolve: { fallback: any; alias: any; }; experiments: any; }, { isServer }: any) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      config.resolve.alias = {
        ...config.resolve.alias,
        'onnxruntime-node$': false,
        'sharp$': false,
      };
    }

    // ปิด warning ของ WebAssembly (เพราะใช้ ort-wasm)
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
    };

    return config;
  },
};

export default nextConfig;
