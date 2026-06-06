/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/normandie-etancheite",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
