"use client";

import * as React from "react";
import { PictureRailGallery } from "./picture-rail-gallery";
import { EXHIBITION_GALLERY_ITEMS, type PictureRailItem } from "@/data/exhibitionGalleryData";

export { EXHIBITION_GALLERY_ITEMS, type PictureRailItem };

export function PictureRailGalleryDemo() {
  return (
    <div className="w-full">
      <PictureRailGallery
        items={EXHIBITION_GALLERY_ITEMS}
        eyebrow="CURATED EXHIBITION WALL"
        heading="Innovation Picture Rail"
        caption="Click and drag any wire to swing the prints along the brass rail. Click any frame to lift it into close-up study or flip to examine technical specs."
        autoplay={false}
      />
    </div>
  );
}

export default PictureRailGalleryDemo;
