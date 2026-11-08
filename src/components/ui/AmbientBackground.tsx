'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AeroShards from '@/components/reactbits/AeroShards';
import { useExhibitionStore } from '@/store/useExhibitionStore';

export default function AmbientBackground() {
  const pathname = usePathname();
  const theme = useExhibitionStore((state) => state.theme);
  const isMobile = useExhibitionStore((state) => state.isMobile);
  const isLight = theme === 'light';

  // Do not render behind the dedicated 3D exhibition room
  if (pathname === '/expo') {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-500 ${
        isLight ? 'opacity-25' : 'opacity-50'
      }`}
      aria-hidden="true"
    >
      <AeroShards
        shardColor={isLight ? '#94a3b8' : '#896ABD'}
        accentColor={isLight ? '#60a5fa' : '#A855F7'}
        placement="full"
        material="glass"
        count={isLight ? (isMobile ? 120 : 420) : (isMobile ? 250 : 1300)}
        speed={isLight ? (isMobile ? 0.35 : 0.5) : (isMobile ? 0.5 : 0.8)}
        lightMode={isLight}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
