'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useExhibitionStore } from '@/store/useExhibitionStore';

export default function AmbientBackground() {
  const pathname = usePathname();
  const theme = useExhibitionStore((state) => state.theme);
  const isLight = theme === 'light';

  // Do not render behind the dedicated 3D exhibition room
  if (pathname === '/expo') {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Precision Crisp Engineering Blueprint Grid (Zero Blur, Zero Distortion) */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isLight
            ? 'opacity-[0.04] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:32px_32px]'
            : 'opacity-[0.06] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px]'
        }`}
      />
      {/* Subtle Atmospheric Radial Accent Glows */}
      <div
        className={`absolute -top-40 -left-40 w-96 h-96 rounded-full transition-opacity duration-500 ${
          isLight ? 'bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)]' : 'bg-blue-600/10'
        }`}
      />
      <div
        className={`absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full transition-opacity duration-500 ${
          isLight ? 'bg-[radial-gradient(circle,rgba(245,158,11,0.06)_0%,transparent_70%)]' : 'bg-purple-600/10'
        }`}
      />
    </div>
  );
}
