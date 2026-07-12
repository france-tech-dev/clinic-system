"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const LOGO = {
  light: "/paris.png",
  dark: "/logo.png",
} as const;

interface ThemeLogoProps {
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function ThemeLogo({
  alt = "NOME DA EMPRESA AQUI",
  width = 200,
  height = 200,
  className = "w-full object-cover",
}: ThemeLogoProps) {
  const theme = useTheme();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const lightOrDarkLogo = !mounted
    ? LOGO.light
    : theme.resolvedTheme === "dark"
      ? LOGO.dark
      : LOGO.light;

  return (
    <Image
      src={lightOrDarkLogo}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="eager"
    />
  );
}
