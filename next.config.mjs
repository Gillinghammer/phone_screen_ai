/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "phonescreen.ai",
          },
        ],
        destination: "https://app.phonescreen.ai/:path*",
        permanent: true,
      },
      // Exclude the root path from redirection
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "phonescreen.ai",
          },
        ],
        destination: "https://phonescreen.ai",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
