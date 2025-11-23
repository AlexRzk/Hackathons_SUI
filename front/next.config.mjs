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
        search: 'rarity=*',
      },
      {
        pathname: '/api/rarity-art/*',
      },
    ],
  },
};

export default nextConfig;
