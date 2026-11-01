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
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#070b14',
};

export const metadata: Metadata = {
  title: 'DPSI Tech & Innovation Exhibition | 3D Floor Plan & Live Voting',
  description:
    'Interactive 3D Virtual Floor Plan matching the physical blueprint: Physical (P01-12), Digital (D01-12), Business (B01-07), and Robotics Arenas for DPS Indirapuram.',
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
