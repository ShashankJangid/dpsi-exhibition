'use client';

import React from 'react';
import BlobCursor from '@/components/reactbits/BlobCursor';
import { useExhibitionStore } from '@/store/useExhibitionStore';

export default function CustomCursor() {
  const theme = useExhibitionStore((state) => state.theme);
  const isMobile = useExhibitionStore((state) => state.isMobile);
  const isLight = theme === 'light';

  // Completely disable custom virtual cursor on mobile and touch devices
  if (isMobile) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[2] overflow-hidden"
      aria-hidden="true"
    >
      <BlobCursor
        material="chrome"
        color={isLight ? '#2563eb' : '#3B82F6'}
        size={isLight ? 52 : 64}
        hideCursor={true}
      />
    </div>
  );
}
