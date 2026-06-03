/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  // bcryptjs and ws use native Node.js internals — keep them server-side only.
  serverExternalPackages: ["bcryptjs", "ws", "@prisma/client", "@prisma/adapter-neon"],
};

export default nextConfig;
