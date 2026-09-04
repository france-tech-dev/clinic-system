import { cn } from "@/shared/lib/utils";

type MediaPlaceholderProps = {
  label: string;
  className?: string;
  /** Tailwind aspect utility, e.g. aspect-[4/3] */
  aspectClassName?: string;
};

/** Slot visual até existirem assets reais — não é conteúdo do produto. */
export function MediaPlaceholder({
  label,
  className,
  aspectClassName = "aspect-[4/3]",
}: MediaPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/80 bg-muted/40 text-center dark:bg-muted/20",
        aspectClassName,
        className,
      )}
    >
      <p className="max-w-[16rem] px-4 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
