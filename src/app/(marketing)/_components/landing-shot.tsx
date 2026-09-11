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
  className?: string;
  frameClassName?: string;
  priority?: boolean;
};

export function LandingShot({
  name,
  alt,
  className,
  frameClassName,
  priority = false,
}: LandingShotProps) {
  const isPhone = name === "app";
  const width = isPhone ? 480 : 1920;
  const height = isPhone ? 1000 : 1000;

  const imgClass = cn(
    "h-auto w-full max-w-none",
    className,
  );

  return (
    <div className={cn("relative overflow-hidden", frameClassName)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- prints de marketing: ficheiro na resolução nativa */}
      <img
        src={`/marketing/light/${name}.webp`}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        className={cn(imgClass, "dark:hidden")}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/marketing/dark/${name}.webp`}
        alt=""
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={cn(imgClass, "hidden dark:block")}
        aria-hidden
      />
    </div>
  );
}
