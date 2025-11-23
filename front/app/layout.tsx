import type React from 'react';
import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './global.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'CryptoMonsters - Hatch, Discover & Evolve',
  description: 'Explore the CryptoMonsters lab, marketplace, and battle-ready NFT roster.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Material+Symbols+Outlined&display=swap"
        />
      </head>
      <body className="bg-[#131022] text-white antialiased">
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
