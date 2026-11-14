import Link from "next/link";
import { CldImage } from "@/components/brand/CldImage";
import { PlaceholderFigure } from "@/components/brand/PlaceholderFigure";
import { cloudinaryEnabled } from "@/lib/cloudinary";
import { readableOn } from "@/lib/colour";
import type { ProductCardData } from "@/lib/data/home";
import { formatPrice } from "@/lib/price";
import { WishlistButton } from "./WishlistButton";

const isCutout = (publicId: string) => publicId.startsWith("site/product-cutouts/");

/** Product photo, or a colour field in the product's own colour until photos are uploaded. */
export function ProductMedia({ product, sizes }: { product: ProductCardData; sizes: string }) {
  if (product.image && cloudinaryEnabled) {
    return (
      // Cut-outs (background removed) stand on the sand tile; ordinary photos fill it.
      isCutout(product.image.publicId) ? (
        <span className="absolute inset-x-[6%] top-[5%] bottom-0">
          <CldImage
            publicId={product.image.publicId}
            alt={product.image.alt}
            sizes={sizes}
            className="object-contain object-bottom transition-transform duration-700 ease-entrance group-hover:scale-[1.03]"
          />
        </span>
      ) : (
        <CldImage
          publicId={product.image.publicId}
          alt={product.image.alt}
          sizes={sizes}
          crop={{ ratio: 4 / 3, gravity: "auto" }}
          className="object-cover transition-transform duration-700 ease-entrance group-hover:scale-[1.03]"
        />
      )
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

export function ProductCard({ product, index = 0 }: { product: ProductCardData; index?: number }) {
  const href = `/product/${product.slug}`;
  return (
    <article className="group relative" data-reveal style={{ "--i": index % 4 } as React.CSSProperties}>
      <Link href={href} className="relative block aspect-[3/4] overflow-hidden bg-sand" tabIndex={-1} aria-hidden="true">
        <ProductMedia product={product} sizes="(min-width: 1024px) 25vw, 50vw" />
      </Link>
      <WishlistButton productId={product.id} productName={product.name} />

      <h3 className="mt-4 text-[1.0625rem] leading-snug font-semibold">
        <Link href={href} className="hover:underline">
          {product.name}
        </Link>
      </h3>
      <p className="mt-1 text-base text-ink-soft">{formatPrice(product.priceNgn, product.tags)}</p>

      {product.colourways.length > 1 && (
        <ul aria-label="Colours" className="mt-3 flex gap-1.5">
          {product.colourways.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/product/${c.slug}`}
                aria-label={`${c.colour}${c.slug === product.slug ? " (this colour)" : ""}`}
                aria-current={c.slug === product.slug ? "true" : undefined}
                className="block h-6 w-6 border border-ink/20 p-0.5 aria-[current=true]:border-ink"
              >
                <span className="block h-full w-full" style={{ backgroundColor: c.hex ?? "transparent" }} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
