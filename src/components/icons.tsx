import type { SVGProps } from "react";

/** Simple 1.5px line icons on a 24px grid. Decorative by default. */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 22, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </Icon>
);

export const AccountIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6" />
  </Icon>
);

export const HeartIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
  </Icon>
);

export const BagIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 8h15l-1 13h-13l-1-13Z" />
    <path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8" />
  </Icon>
);

export const HomeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 10.5 12 4l8.5 6.5V20h-5.5v-6h-6v6H3.5v-9.5Z" />
  </Icon>
);

export const ShopIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
  </Icon>
);

export const MenuIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 7h18M3 12h18M3 17h18" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 5l14 14M19 5 5 19" />
  </Icon>
);

export const TruckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z" />
    <circle cx="6.5" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </Icon>
);

export const ReturnIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 4 4 8l4 4" />
    <path d="M4 8h10a6 6 0 0 1 0 12H7" />
  </Icon>
);

export const QualityIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="9" r="6" />
    <path d="m9.5 9 1.8 1.8L14.5 7.5M8.5 14 7 21l5-2.5 5 2.5-1.5-7" />
  </Icon>
);

export const LockIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
  </Icon>
);
