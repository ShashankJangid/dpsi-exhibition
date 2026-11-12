import type { Metadata, Viewport } from 'next';
import { Outfit, Space_Grotesk } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#070b14',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://dpsiexibition.pages.dev'),
  title: 'DPSI Innovation Fest | 3D Floor Plan & Live Voting',
  description:
    'Interactive 3D Virtual Floor Plan & Live Voting Platform matching the physical blueprint: 44 student inventions across Physical (P01–12), Digital (D01–12), Business (B01–08), Show & Tell (ST01–08), and Robotics Arenas for DPS Indirapuram.',
  keywords: [
    'DPSI',
    'DPS Indirapuram',
    'DPSI Innovation Fest',
    'Tech Exhibition',
    'Innovation Summit',
    '3D Floor Plan',
    'Student Inventions',
    'Live Voting',
  ],
  openGraph: {
    title: 'DPSI Innovation Fest 2026',
    description:
      'Explore 44 breakthrough student inventions across 3 exhibition zones with live anti-cheat voting and an interactive 3D virtual floor plan.',
    url: 'https://dpsiexibition.pages.dev',
    siteName: 'DPSI Innovation Fest',
    images: [
      {
        url: '/dps_shield.png',
        width: 512,
        height: 512,
        alt: 'Delhi Public School Indirapuram Crest',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DPSI Innovation Fest 2026',
    description:
      'Explore 44 breakthrough student inventions across 3 exhibition zones with live anti-cheat voting and an interactive 3D virtual floor plan.',
    images: ['/dps_shield.png'],
  },
  icons: {
    icon: '/dps_shield.png',
    apple: '/dps_shield.png',
  },
};

import AmbientBackground from '@/components/ui/AmbientBackground';
import CustomCursor from '@/components/ui/CustomCursor';
import ThemeSync from '@/components/ui/ThemeSync';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${spaceGrotesk.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen w-full bg-[#dfe3e8] dark:bg-[#000000] text-[#1e293b] dark:text-[#f1f5f9] font-sans selection:bg-amber-500 selection:text-black relative transition-colors duration-300" suppressHydrationWarning>
        <ThemeSync />

        {/* Ambient refractive glass background simulation */}
        <AmbientBackground />

        {/* Dynamic BlobCursor liquid chrome pointer element that renders behind text */}
        <CustomCursor />

        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
