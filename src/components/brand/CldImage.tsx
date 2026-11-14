"use client";

import Image from "next/image";
import { cldImage } from "@/lib/cloudinary";

type Props = {
  /** Cloudinary public_id. */
  publicId: string;
  alt: string;
  /** Responsive `sizes` hint; the image always fills its (positioned) parent. */
  sizes: string;
  className?: string;
  /** Crop server-side to this height / width ratio, keeping the face or subject in frame. */
  crop?: { ratio: number; gravity: "face" | "auto" | "center" };
  /** True for the one image that is the page's largest paint. */
  priority?: boolean;
};

/**
 * A Cloudinary photo sized by Cloudinary (f_auto, q_auto, responsive widths).
 * It is a client component because next/image loaders are functions, which
 * server components cannot pass down.
 */
export function CldImage({ publicId, alt, sizes, className = "", crop, priority = false }: Props) {
  return (
    <Image
      src={publicId}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      loader={({ width, quality }) =>
        cldImage(publicId, {
          width,
          quality: quality && quality < 60 ? "auto:eco" : "auto",
          ...(crop ? { height: Math.round(width * crop.ratio), crop: "fill" as const, gravity: crop.gravity } : {}),
        })
      }
      preload={priority}
      fetchPriority={priority ? "high" : "auto"}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
