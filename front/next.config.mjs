const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    localPatterns: [
      {
        pathname: '/api/rarity-art',
      },
      {
        pathname: '/api/rarity-art/*',
      },
    ],
  },
};

export default nextConfig;
