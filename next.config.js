/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'image.tmdb.org',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'imgur.com',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'i.imgur.com',
            port: '',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'arc.io',
            port: '',
            pathname: '/**',
          },
        ],
      },
      env: {
        API_KEY: process.env.API_KEY,
        TMDB_ACCESS_TOKEN: process.env.TMDB_ACCESS_TOKEN,
      },
      webpack: (config, { dev, isServer }) => {
        // Optimize webpack cache for better stability
        if (dev) {
          config.cache = {
            type: 'filesystem',
            buildDependencies: {
              config: [__filename],
            },
          };
        }
        return config;
      },
}

module.exports = nextConfig
