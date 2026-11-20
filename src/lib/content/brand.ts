/**
 * Owner-supplied copy for the content pages (About, FAQs, Shipping & returns),
 * verbatim from the "Required Details" document, November 2026.
 * The About, FAQ and policy pages render from here (Phase 8).
 */

export const ABOUT_STORY = {
  title: "The Story Behind Ebonímode",
  paragraphs: [
    "Ebonímode was born from an appreciation for African heritage, craftsmanship and the beauty of self-expression.",
    "We believe that the stories, techniques and traditions passed down through generations deserve a place in contemporary fashion. Rather than simply preserving these traditions, we seek to explore them, reinterpret them and introduce them to new audiences through thoughtful design.",
    "Our creative journey is driven by the desire to bring traditional African textiles into everyday wardrobes. Through Adire, Asọ́ọ̀kẹ and other distinctive materials, we create pieces that connect the past with the present.",
    "From the hands of local artisans to the final silhouette, every detail is an opportunity to celebrate creativity, culture and the people behind the craft.",
    "Ebonímode is our way of telling African stories through fashion, one collection at a time.",
  ],
};

export const VISION = [
  "To become a globally recognised African fashion brand, championing contemporary design, traditional craftsmanship, ethical production and community empowerment.",
  "We envision a future where African textiles, creative talent and cultural expressions receive the recognition they deserve on the global fashion stage.",
];

export const MISSION = [
  "To create distinctive contemporary fashion that celebrates African heritage through thoughtful design, responsible production and meaningful collaborations with local artisans.",
  "We are committed to making craftsmanship relevant to modern wardrobes while creating opportunities for the communities and creatives who bring our designs to life.",
];

export const CORE_VALUES = [
  {
    title: "Cultural Authenticity",
    body: "We honour African heritage through traditional craftsmanship, heritage textiles, Adire techniques and designs that reflect our cultural identity.",
  },
  {
    title: "Sustainability & Conscious Production",
    body: "We believe in creating with intention. Through thoughtful material choices, responsible production and efforts to minimise fabric waste, we aim to make better use of resources.",
  },
  {
    title: "Ethical Craftsmanship",
    body: "We value the hands and expertise behind every creation. We are committed to working with artisans and local producers, recognising their contribution to the fashion industry.",
  },
  {
    title: "Community Empowerment",
    body: "We believe fashion can create opportunities beyond the finished garment. We support the growth of local creative communities and the preservation of traditional textile skills.",
  },
  {
    title: "Timeless Elegance",
    body: "We create pieces that go beyond fleeting trends. Our designs balance contemporary silhouettes with enduring appeal, allowing our customers to enjoy their wardrobes across seasons.",
  },
  {
    title: "Innovation in African Fashion",
    body: "We continuously explore new ways to interpret traditional textiles, techniques and cultural influences through contemporary design.",
  },
];

export const FAQS = [
  {
    q: "What makes Ebonímode different?",
    a: "At Ebonímode, we create contemporary fashion rooted in African heritage and craftsmanship. Our Adire fabrics are custom-designed and hand-dyed specifically for our collections, making each piece a distinctive expression of artistry, culture and individual style.",
  },
  {
    q: "Are your Adire pieces exactly the same?",
    a: "No. Our Adire fabrics are individually hand-dyed by skilled artisans. Because of the handmade process, slight variations in colour, shade and pattern may occur. This means every piece has its own unique character.",
  },
  {
    q: "Will the product I receive look exactly like the photograph?",
    a: "Our product images are representative of the actual designs. However, slight variations in colour, shade and pattern placement may occur due to the handcrafted nature of our fabrics and differences in screen displays.",
  },
  {
    q: "Will the fabric wash?",
    a: "Our Adire fabrics are hand-dyed and require careful handling. We recommend following the specific fabric care instructions provided with your garment to preserve its colour and quality.",
  },
  {
    q: "What if I am unsure of my size?",
    a: "We recommend consulting our size guide before placing your order. If you need further assistance, please contact our team for sizing guidance before completing your purchase.",
  },
];

/** General fabric care, for pieces without their own care notes. */
export const FABRIC_CARE = [
  "Hand wash gently in cold water with mild detergent.",
  "Wash similar colours separately.",
  "Do not bleach or use harsh chemicals.",
  "Avoid excessive wringing or twisting.",
  "Do not tumble dry. Air dry in the shade.",
  "Iron on a low to medium setting, preferably inside out.",
  "Store in a cool, dry place.",
];

/** Delivery fees live in the shipping_rates table; these are the policy words around them. */
export const SHIPPING_POLICY = {
  processing: [
    "All orders are processed within 1–3 working days.",
    "During peak seasons, promotional periods or pop-up events, processing may take an additional working day. We always aim to prepare and dispatch orders as promptly as possible.",
  ],
  timelines: [
    { where: "Within Lagos", when: "1–3 working days after dispatch." },
    { where: "Outside Lagos (Nigeria)", when: "2–5 working days after dispatch." },
    { where: "International Shipping", when: "5–10 working days, depending on the destination and courier timelines." },
  ],
  timelineNotes: [
    "Please note that delivery timelines are estimates and may vary due to unforeseen circumstances.",
    "Once your order has been dispatched, you will receive a notification with tracking details where applicable.",
  ],
  feesNote: "Delivery fees vary depending on your location and will be calculated at checkout.",
  international: [
    "International customers are responsible for any applicable customs duties, import taxes or additional charges imposed by their destination country.",
    "Ebonímode is not responsible for delays caused by courier services, customs processes or incorrect delivery information provided at checkout.",
    "Please ensure that your shipping details and contact information are accurate before completing your order.",
  ],
};

export const RETURNS_POLICY = {
  intro: "We want you to love every Ebonímode piece. If something isn’t quite right, here’s how our returns and exchanges work.",
  eligibility: [
    "Items must be returned within 5 days of delivery.",
    "Items must be unused, unworn, unwashed and in their original condition.",
    "Original tags and packaging must remain intact.",
    "Items showing signs of wear, damage or alteration will not be accepted.",
  ],
  finalSale: ["Sale and discounted items.", "Purchases made during pop-up events.", "Items that do not meet our return eligibility requirements."],
  finalSaleNote: "These items cannot be returned or exchanged.",
  exchanges: [
    "If you require a different size or would like to exchange your purchase for another available item, kindly contact us within 5 days of delivery.",
    "Exchanges are subject to product availability and approval.",
  ],
  refunds: [
    "Ebonímode operates a store-credit policy for eligible returns.",
    "Once your returned item has been received and inspected, store credit will be issued if it meets our return conditions.",
    "We do not offer cash refunds for eligible change-of-mind returns.",
    "Store credit can be used towards a future purchase with Ebonímode.",
  ],
  shipping: "Customers are responsible for the shipping costs associated with returning or exchanging an item.",
  damaged: [
    "If you receive an incorrect or damaged item, please contact our customer service team with your order details and clear photographs of the issue so we can review and assist you.",
    "We recommend contacting us as soon as possible after delivery.",
  ],
};
