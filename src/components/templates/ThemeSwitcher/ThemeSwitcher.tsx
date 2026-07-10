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
    <Button onClick={() => setTheme(isDark ? "light" : "dark")} size="icon">
      {isDark ? (
        <Sun className="w-4 h-4" key="sun" />
      ) : (
        <Moon className="w-4 h-4" key="moon" />
      )}
    </Button>
  );
};

export default ThemeSwitcher;
