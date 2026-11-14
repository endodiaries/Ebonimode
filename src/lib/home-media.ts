/**
 * Photos used by fixed homepage sections, as Cloudinary public ids.
 * These are real Ebonímode photographs from the brand's shoot folders.
 * They become admin-editable with the "site content" screen in Phase 7.
 */
export const HOME_MEDIA = {
  departments: {
    women: { publicId: "IMG_9809", alt: "Model mid-step in the blue Omi Eko Silk Pant Set" },
    men: { publicId: "IMG_9864", alt: "Man in the Dele Linen Set on a balcony" },
  },
  story: {
    publicId: "IMG_9824",
    alt: "Model holding out a hand-dyed silk handkerchief skirt to show the Lagos skyline artwork",
  },
} as const;
