/**
 * Photos used by fixed homepage sections, as Cloudinary public ids.
 * These are real Ebonímode photographs from the brand's shoot folders.
 * They become admin-editable with the "site content" screen in Phase 7.
 */
export const HOME_MEDIA = {
  departments: {
    women: { publicId: "8AADCA0E-44F7-4414-A438-1B78842C3D0E", alt: "Model in a brown and peach Adire set" },
    men: { publicId: "IMG_9865", alt: "Man in a peach tunic with striped panels" },
    newIn: { publicId: "IMG_9810", alt: "Model in a blue silk pant set" },
  },
  story: {
    publicId: "IMG_9824",
    alt: "Model holding out a hand-dyed silk handkerchief skirt to show the Lagos skyline artwork",
  },
} as const;
