/**
 * Privacy Policy and Terms of Sale. DRAFTS written for the owner on 26 November 2026 from the
 * shop's real setup and the owner's own policies, under Nigerian law (NDPA 2023, FCCPA 2018).
 * The owner should have them reviewed before launch. Edit the text here; the pages render it.
 */
import { RETURNS_POLICY } from "@/lib/content/brand";
import { contact } from "@/lib/site";

export type LegalSection = { heading: string; paragraphs?: string[]; list?: string[]; after?: string[] };

export const LEGAL_UPDATED = "26 November 2026";

export const PRIVACY: LegalSection[] = [
  {
    heading: "Who we are",
    paragraphs: [
      `Ebonímode ("we", "us", "our") is an Afrocentric fashion brand based at ${contact.address}, Nigeria. We run this website and are responsible for the personal information you share with us here.`,
      `This policy explains what we collect, why, who we share it with and the choices you have. If you have any questions, email us at ${contact.email}.`,
    ],
  },
  {
    heading: "What we collect",
    paragraphs: ["Information you give us:"],
    list: [
      "Your name, email address, phone number and delivery address when you place an order.",
      "The details of your order: the pieces, sizes and quantities, the delivery option and any note you add.",
      "Your name, email address and password if you create an account, or your name and email from Google if you choose to sign in with Google.",
      "Your email address if you join our newsletter.",
      "Anything you send us by email or WhatsApp, and any review you write.",
    ],
    after: [
      "Payment details: your card or bank details are entered on Paystack's secure page, not on our website. We never see or store your full card number. Paystack tells us whether a payment succeeded and how much was paid.",
      "Information collected automatically: like most websites, our servers record basic technical information such as your browser, device and the pages you visit, to keep the site working and secure. Your shopping bag, wishlist and chosen currency are stored on your own device.",
    ],
  },
  {
    heading: "How we use your information",
    list: [
      "To process, prepare and deliver your order, and to send you updates about it.",
      "To take payment and prevent fraud.",
      "To answer your questions and handle returns, exchanges and store credit.",
      "To run your account, if you have one, including your order history and wishlist.",
      "To send you our newsletter, only if you have asked for it. You can unsubscribe at any time.",
      "To keep the website secure and improve how it works.",
      "To meet our legal, tax and accounting obligations.",
    ],
  },
  {
    heading: "Our legal reasons for using it",
    paragraphs: ["Under the Nigeria Data Protection Act 2023, we use your information because:"],
    list: [
      "We need it to fulfil our contract with you when you place an order or create an account.",
      "You have given your consent, for example to receive our newsletter.",
      "We have a legitimate interest in running a safe, working shop, in a way that does not override your rights.",
      "The law requires us to keep certain records.",
    ],
  },
  {
    heading: "Who we share it with",
    paragraphs: ["We share only what each partner needs to do its job:"],
    list: [
      "Paystack, to process your payment.",
      "Our delivery partners, to bring your order to you: our dispatch riders and couriers within Nigeria, and DHL Express for international orders.",
      "The providers who run our website for us: Supabase (our database and secure sign-in), Cloudinary (our images) and our email provider (order and newsletter emails).",
      "Google, only if you choose to sign in with Google.",
      "Authorities, if the law requires it.",
    ],
    after: ["We do not sell your personal information, and we do not share it with anyone for their own marketing."],
  },
  {
    heading: "Information stored outside Nigeria",
    paragraphs: [
      "Some of our providers store information on servers outside Nigeria. When this happens we use reputable providers that protect data to a standard consistent with the Nigeria Data Protection Act 2023.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "We keep your information only as long as we need it for the purposes above. Order records are kept for as long as tax and accounting law requires. Account details are kept until you ask us to close your account. Newsletter details are kept until you unsubscribe.",
    ],
  },
  {
    heading: "Your rights",
    paragraphs: ["You have the right to:"],
    list: [
      "Ask for a copy of the personal information we hold about you.",
      "Ask us to correct information that is wrong or incomplete.",
      "Ask us to delete your information, where we no longer need to keep it.",
      "Object to how we use it, or ask us to limit it.",
      "Withdraw your consent at any time, for example by unsubscribing from our newsletter.",
      "Ask for your information in a format you can take elsewhere.",
    ],
    after: [
      `To use any of these rights, email ${contact.email}. We will reply within 30 days. If you are not happy with our answer, you can complain to the Nigeria Data Protection Commission (NDPC).`,
    ],
  },
  {
    heading: "Keeping it safe",
    paragraphs: [
      "We use secure connections (HTTPS), trusted providers and access controls so that only the right people can see your information. No website can be completely secure, but we take reasonable care to protect what you share with us.",
    ],
  },
  {
    heading: "Children",
    paragraphs: ["Our website is meant for adults. We do not knowingly collect personal information from anyone under 18 without a parent's or guardian's consent."],
  },
  {
    heading: "Cookies",
    paragraphs: [
      "We use only the small files and device storage needed for the site to work: keeping you signed in, remembering your bag, wishlist and currency. If we add analytics or advertising cookies in future, we will ask for your consent first and update this policy.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: ["We may update this policy from time to time. The date at the top shows when it last changed. Important changes will be announced on this page."],
  },
  {
    heading: "Contact us",
    paragraphs: [`Email ${contact.email}, call or WhatsApp ${contact.phone}, or write to us at ${contact.address}.`],
  },
];

export const TERMS: LegalSection[] = [
  {
    heading: "About these terms",
    paragraphs: [
      `These terms apply when you browse or buy from the Ebonímode website. By placing an order you agree to them, together with our Delivery & Shipping Policy, our Returns, Exchanges & Refund Policy and our Privacy Policy. Ebonímode is based at ${contact.address}, Nigeria.`,
    ],
  },
  {
    heading: "Our pieces",
    paragraphs: [
      "Many of our pieces are made with Adire that is hand-drawn and hand-dyed by artisans. Slight variations in colour, shade and pattern are part of the handmade process and are not faults. Our photographs represent each design faithfully, but colours can also look different from screen to screen.",
    ],
  },
  {
    heading: "Sizes and made-to-order pieces",
    paragraphs: [
      "Women's sizes 8 to 18 are made ready to ship. Sizes below 8 or above 18 are made to order and take 5 to 7 days to make, before delivery. Men's pieces come in S to XXL. Please check our size guide before ordering, and ask us if you are unsure.",
    ],
  },
  {
    heading: "Prices and payment",
    list: [
      "Prices are shown in Nigerian naira (₦). Delivery is added at checkout according to your location.",
      "If you view prices in another currency, they are shown for reference; we will tell you clearly at checkout what you will be charged.",
      "Payment is taken securely by Paystack, by card, bank transfer or USSD.",
      "We may change our prices at any time, but changes do not affect orders already paid for.",
    ],
  },
  {
    heading: "Your order",
    paragraphs: [
      "Your order is confirmed once we have received and verified your payment, and you will see an order confirmation. We may cancel an order if a piece is no longer available, if there is an obvious error in its price or description, or if we suspect fraud. If we cancel your order, we will tell you and refund what you paid in full.",
    ],
  },
  {
    heading: "Delivery",
    paragraphs: [
      "Orders are processed within 1 to 3 working days, then delivered within the timelines in our Delivery & Shipping Policy. Delivery times are estimates. Please make sure your address and phone number are correct; we are not responsible for delays caused by incorrect details.",
      "International orders are delivered by DHL Express. International customers are responsible for any customs duties, import taxes or charges in their country.",
    ],
  },
  {
    // The owner's own Returns, Exchanges & Refund Policy, word for word (Required Details doc).
    heading: "Returns, exchanges and refunds",
    paragraphs: [RETURNS_POLICY.intro, "To qualify for a return:"],
    list: RETURNS_POLICY.eligibility,
    after: [
      `The following purchases are considered final sale: ${RETURNS_POLICY.finalSale.map((f) => f.replace(/\.$/, "").toLowerCase()).join("; ")}. ${RETURNS_POLICY.finalSaleNote}`,
      ...RETURNS_POLICY.exchanges,
      ...RETURNS_POLICY.refunds,
      RETURNS_POLICY.shipping,
      ...RETURNS_POLICY.damaged,
    ],
  },
  {
    heading: "Promo codes",
    paragraphs: ["Promo codes are subject to the conditions stated with each code, cannot be exchanged for cash and may be withdrawn at any time. Only one code can be used per order."],
  },
  {
    heading: "Your account",
    paragraphs: ["If you create an account, please keep your password private. You are responsible for activity on your account. Tell us straight away if you think someone else has used it."],
  },
  {
    heading: "Reviews",
    paragraphs: [
      "If you post a review, it must be honest and your own, and must not be offensive or unlawful. You allow us to show it on our website and social media. We may decline or remove reviews that break these rules.",
    ],
  },
  {
    heading: "Our designs and content",
    paragraphs: [
      "Our designs, Adire artwork, photographs, logo, text and the website itself belong to Ebonímode or our partners. You may not copy, reproduce or use them for commercial purposes without our written permission.",
    ],
  },
  {
    heading: "Using our website",
    paragraphs: ["Please do not misuse the website: no attempts to break in, disrupt it, place fake orders or use it for anything unlawful."],
  },
  {
    heading: "Our responsibility to you",
    paragraphs: [
      "We take care to describe our pieces accurately and deliver them on time. To the extent the law allows, we are not responsible for losses that were not foreseeable, or for delays caused by events outside our control. Nothing in these terms limits your rights under the Federal Competition and Consumer Protection Act 2018 or any other law that protects consumers.",
    ],
  },
  {
    heading: "Governing law",
    paragraphs: ["These terms are governed by the laws of the Federal Republic of Nigeria. Any dispute will be handled by the courts of Lagos State, and we will always try to resolve concerns with you directly first."],
  },
  {
    heading: "Changes to these terms",
    paragraphs: ["We may update these terms from time to time. The version on this page when you place your order is the one that applies to it."],
  },
  {
    heading: "Contact us",
    paragraphs: [`Email ${contact.email} or call or WhatsApp ${contact.phone}.`],
  },
];
