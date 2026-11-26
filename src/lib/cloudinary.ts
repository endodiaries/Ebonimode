/**
 * Cloudinary delivery helpers. Only the public cloud name is used here;
 * the API secret stays server-side (see .env.example).
 */
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export const cloudinaryEnabled = Boolean(cloudName);

type CldOptions = {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit" | "pad";
  gravity?: "auto" | "face" | "center";
  quality?: "auto" | "auto:eco" | "auto:good";
};

/** Build a delivery URL for an image `public_id` with f_auto,q_auto. */
export function cldImage(publicId: string, opts: CldOptions = {}): string {
  if (!cloudName) throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set");
  const t = [`f_auto`, `q_${opts.quality ?? "auto"}`];
  if (opts.width) t.push(`w_${Math.round(opts.width)}`);
  if (opts.height) t.push(`h_${Math.round(opts.height)}`);
  if (opts.width || opts.height) t.push(`c_${opts.crop ?? "limit"}`);
  if (opts.gravity && opts.crop === "fill") t.push(`g_${opts.gravity}`);
  return `https://res.cloudinary.com/${cloudName}/image/upload/${t.join(",")}/${publicId}`;
}

/**
 * A flat, single-colour silhouette of a cut-out (transparent background kept), used as the
 * coloured "shadow" behind models in the hero. Cloudinary colourises every opaque pixel.
 */
export function cldSilhouette(publicId: string, hex: string, width = 900): string {
  if (!cloudName) throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set");
  const colour = hex.replace("#", "").toUpperCase();
  return `https://res.cloudinary.com/${cloudName}/image/upload/e_colorize:100,co_rgb:${colour},f_auto,q_auto,w_${width},c_limit/${publicId}`;
}

/** Build a delivery URL for a video `public_id`. */
export function cldVideo(publicId: string, width = 1280): string {
  if (!cloudName) throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set");
  return `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto,w_${width},c_limit/${publicId}`;
}

/** next/image loader: lets Cloudinary do the resizing instead of the Next server. */
export function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  return cldImage(src, {
    width,
    quality: quality && quality < 60 ? "auto:eco" : "auto",
  });
}
