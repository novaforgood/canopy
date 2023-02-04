/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  redirects() {
    return [
      {
        source: "/go/:path*",
        destination: "/:path*",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
