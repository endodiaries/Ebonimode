/**
 * Photos used by fixed homepage sections, as Cloudinary public ids.
 * Real Ebonímode photographs with the background removed (Cloudinary background
 * removal), shown on flat colour fields like the rest of the site.
 * They become admin-editable with the "site content" screen in Phase 7.
 */
export const HOME_MEDIA = {
  departments: {
    women: { publicId: "site/cutouts/home-women", alt: "Model mid-step in the blue Omi Eko Silk Pant Set", field: "#EE8720" },
    men: { publicId: "site/cutouts/home-men", alt: "Man in the Dele Linen Set", field: "#1D3714" },
  },
  story: {
    publicId: "site/cutouts/home-story",
    alt: "Model holding out a hand-dyed silk handkerchief skirt to show the Lagos skyline artwork",
  },
} as const;
