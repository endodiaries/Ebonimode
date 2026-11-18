import Link from "next/link";
import { CldImage } from "@/components/brand/CldImage";
import { PlaceholderFigure } from "@/components/brand/PlaceholderFigure";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import { readableOn } from "@/lib/colour";
import type { ProductCardData } from "@/lib/data/home";
import { Price } from "@/lib/currency";
import { WishlistButton } from "./WishlistButton";

/** Swatches shown on a card; the product page shows every colour. */
const MAX_SWATCHES = 4;

const isCutout = (publicId: string) => publicId.startsWith("site/product-cutouts/");

/**
 * Product photo, or a colour field in the product's own colour until photos are uploaded.
 * With `hoverSwap`, a second cut-out fades in when the card is hovered (hover devices only).
 */
export function ProductMedia({ product, sizes, hoverSwap = false }: { product: ProductCardData; sizes: string; hoverSwap?: boolean }) {
  if (product.image && cloudinaryEnabled) {
    const swap = hoverSwap && product.altImage && isCutout(product.image.publicId);
    if (isCutout(product.image.publicId)) {
      // Cut-outs (background removed) stand on the stone tile.
      return (
        <>
          <span
            className={`absolute inset-x-[6%] top-[5%] bottom-0 transition-[opacity,transform] duration-700 ease-entrance group-hover:scale-[1.03] ${
              swap ? "group-hover:opacity-0" : ""
            }`}
          >
            <CldImage publicId={product.image.publicId} alt={product.image.alt} sizes={sizes} className="object-contain object-bottom" />
          </span>
          {swap && product.altImage && (
            <span
              className="absolute inset-x-[6%] top-[5%] bottom-0 scale-[0.98] opacity-0 transition-[opacity,transform] duration-700 ease-entrance group-hover:scale-100 group-hover:opacity-100"
              aria-hidden="true"
            >
              <CldImage publicId={product.altImage.publicId} alt="" sizes={sizes} className="object-contain object-bottom" />
            </span>
          )}
        </>
      );
    }
    return (
      <CldImage
        publicId={product.image.publicId}
        alt={product.image.alt}
        sizes={sizes}
        crop={{ ratio: 4 / 3, gravity: "auto" }}
        className="object-cover transition-transform duration-700 ease-entrance group-hover:scale-[1.03]"
      />
    );
  }
  const hex = product.colourHex ?? "#EFE6D8";
  return (
    <span
      className={`absolute inset-0 flex items-end justify-center ${readableOn(hex) === "ink" ? "text-ink/25" : "text-ivory/30"}`}
      style={{ backgroundColor: hex }}
    >
      <PlaceholderFigure className="h-[86%] w-auto" />
      <span className="sr-only">Photo to come</span>
    </span>
  );
}

/** Size chips, for the product page and quick views (not shown on cards). Each links to the product with that size chosen; sold-out sizes are struck through. */
export function SizeChips({ product }: { product: ProductCardData }) {
  if (product.sizes.length === 0) return null;
  return (
    <ul aria-label="Sizes" className="mt-3 flex flex-wrap gap-1">
      {product.sizes.map((s) =>
        s.stock > 0 ? (
          <li key={s.size}>
            <Link
              href={`/product/${product.slug}?size=${encodeURIComponent(s.size)}`}
              aria-label={`${product.name}, size ${s.size}`}
              className="flex h-9 min-w-9 items-center justify-center border border-ink/25 px-2 text-sm transition-colors duration-[var(--dur-micro)] hover:border-ink hover:bg-ink hover:text-ivory"
            >
              {s.size}
            </Link>
          </li>
        ) : (
          <li key={s.size}>
            <span className="flex h-9 min-w-9 items-center justify-center border border-ink/10 px-2 text-sm text-ink-soft line-through">
              {s.size}
              <span className="sr-only"> sold out</span>
            </span>
          </li>
        ),
      )}
    </ul>
  );
}

/** `showPrice` is off on the homepage, where the owner wants prices kept for the product page. */
export function ProductCard({
  product,
  index = 0,
  showPrice = true,
  reveal = true,
}: {
  product: ProductCardData;
  index?: number;
  showPrice?: boolean;
  /** Off in filtered lists, where cards change without a page load. */
  reveal?: boolean;
}) {
  const href = `/product/${product.slug}`;
  return (
    <article className="group relative" data-reveal={reveal ? "" : undefined} style={{ "--i": index % 4 } as React.CSSProperties}>
      <Link href={href} className="relative block aspect-[3/4] overflow-hidden bg-sand" tabIndex={-1} aria-hidden="true">
        <ProductMedia product={product} sizes="(min-width: 1024px) 25vw, 50vw" hoverSwap />
      </Link>
      <WishlistButton productId={product.id} productName={product.name} />

      <h3 className="mt-4 text-base leading-snug font-medium">
        <Link href={href} className="hover:underline">
          {product.name}
        </Link>
      </h3>
      {showPrice && (
        <p className="mt-1 text-base text-ink-soft">
          <Price ngn={product.priceNgn} tags={product.tags} />
        </p>
      )}

      {/* The swatch row keeps its height on every card, so names line up across a row. */}
      <div className="mt-2 flex h-11 items-center">
        {product.colourways.length > 1 && (
          <ul aria-label="Colours" className="-ml-2 flex items-center">
            {product.colourways.slice(0, MAX_SWATCHES).map((c) => (
              <li key={c.slug}>
                {/* 36px tap target around a 24px swatch */}
                <Link
                  href={`/product/${c.slug}`}
                  aria-label={`${c.colour}${c.slug === product.slug ? " (this colour)" : ""}`}
                  aria-current={c.slug === product.slug ? "true" : undefined}
                  className="group/sw flex h-11 w-9 items-center justify-center"
                >
                  <span className="block h-6 w-6 border border-ink/20 p-0.5 group-aria-[current=true]/sw:border-ink">
                    <span className="block h-full w-full" style={{ backgroundColor: c.hex ?? "transparent" }} />
                  </span>
                </Link>
              </li>
            ))}
            {product.colourways.length > MAX_SWATCHES && (
              <li>
                <Link href={href} className="flex h-11 items-center px-1 text-sm text-ink-soft hover:text-ink">
                  +{product.colourways.length - MAX_SWATCHES}
                  <span className="sr-only"> more colours</span>
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  );
}
