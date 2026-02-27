/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.nayld.ai",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.nayld.ai" }],
        destination: "https://nayld.ai/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
