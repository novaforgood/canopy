/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  redirects() {
    return [
      {
        source: "/go/:scheme/:path*",
        destination: "/:path*",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
