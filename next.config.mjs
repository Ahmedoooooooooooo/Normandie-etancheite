/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/Normandie-etancheite",
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
