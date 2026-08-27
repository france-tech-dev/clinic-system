"use client";
import { Button } from "@/components/ui/button";
import { IconMoonStars as Moon, IconSun as Sun } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const ThemeSwitcher = () => {
  const { setTheme, resolvedTheme } = useTheme();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
    >
      {isDark ? <Sun key="sun" /> : <Moon key="moon" />}
    </Button>
  );
};

export default ThemeSwitcher;
