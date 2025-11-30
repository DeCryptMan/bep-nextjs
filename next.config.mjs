/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Разрешаем внешние картинки
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Увеличиваем лимит до 10 МБ (или больше, если нужно)
    },
  },
};

export default nextConfig;