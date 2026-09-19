import { cn } from "@/shared/lib/utils";

export type LandingShotName =
  | "app"
  | "calendario"
  | "pacientes"
  | "caixa"
  | "dash"
  | "lista";

type LandingShotProps = {
  name: LandingShotName;
  alt: string;
  priority?: boolean;
};

export function LandingShot({
  name,
  alt,
  priority = false,
}: LandingShotProps) {
  const isPhone = name === "app";
  const width = isPhone ? 960 : 2400;
  const height = isPhone ? 2040 : 1350;
  const imgClass = "h-auto w-full";

  return (
    <div className="relative overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element -- print marketing sem otimizador */}
      <img
        src={`/marketing/light/${name}.png`}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={cn(imgClass, "dark:hidden")}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/marketing/dark/${name}.png`}
        alt=""
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        className={cn(imgClass, "hidden dark:block")}
        aria-hidden
      />
    </div>
  );
}
