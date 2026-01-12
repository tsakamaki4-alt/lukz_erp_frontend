/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // This matches your repository name exactly
  basePath: '/lukz_erp_frontend',
  assetPrefix: '/lukz_erp_frontend',
};

export default nextConfig;