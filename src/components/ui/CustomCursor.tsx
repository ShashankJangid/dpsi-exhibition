'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import BlobCursor from '@/components/reactbits/BlobCursor';
import { useExhibitionStore } from '@/store/useExhibitionStore';

export default function CustomCursor() {
  // Use native zero-latency hardware OS cursor everywhere for maximum precision and sharpness
  return null;
}
