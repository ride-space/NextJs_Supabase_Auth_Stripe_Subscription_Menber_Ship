/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { typedRoutes: true, serverActions: true },
  images: {
    domains: ["khpsnogvgtbfqzwgesys.supabase.co"],
  },
};

export default config;
