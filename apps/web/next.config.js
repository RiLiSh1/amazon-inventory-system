/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@amazon-inventory/shared", "@amazon-inventory/database"],
};

module.exports = nextConfig;
