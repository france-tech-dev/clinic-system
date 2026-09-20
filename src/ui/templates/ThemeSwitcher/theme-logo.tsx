"use client";

import Image from "next/image";
import { BRAND_LOGO } from "@/shared/constants/brand";

interface ThemeLogoProps {
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ThemeLogo({
  alt = "Movi Clínicas",
  width = 32,
  height = 32,
  className = "size-8 object-contain",
}: ThemeLogoProps) {
  return (
    <Image
      src={BRAND_LOGO}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="eager"
      quality={100}
    />
  );
}
