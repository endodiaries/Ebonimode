import type { CSSProperties } from "react";
import { BRAND_NAME } from "@/lib/site";

export type PrintKey = "a" | "b" | "c";

type Props = {
  /** Which batik fill to use (matches hero_slides.print_key). */
  print?: PrintKey;
  className?: string;
  style?: CSSProperties;
  as?: "span" | "p" | "div";
};

/**
 * The signature EBONÍMODE wordmark set in Abril Fatface and filled with batik
 * print. The styled letters are hidden from assistive tech; screen readers
 * get the plain brand name instead.
 */
export function PrintName({ print = "a", className = "", style, as: Tag = "span" }: Props) {
  return (
    <Tag className={className} style={style}>
      <span className="sr-only">{BRAND_NAME}</span>
      <span aria-hidden="true" className="print-name block" data-print={print}>
        EBONÍMODE
      </span>
    </Tag>
  );
}
