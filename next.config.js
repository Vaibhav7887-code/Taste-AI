/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'bcrypt']
    return config
  },
}

module.exports = nextConfig 