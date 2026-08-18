import { SiteHeader } from "@/components/templates/SiteHeader/site-header";
import { cn } from "@/shared/lib/utils";

type AppPageProps = {
  title: string;
  rightContent?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
  fillViewport?: boolean;
};

export function AppPage({
  title,
  rightContent,
  children,
  contentClassName = "px-4 lg:px-6",
  fillViewport = false,
}: AppPageProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <SiteHeader title={title} rightContent={rightContent} />
      <div
        className={
          fillViewport
            ? "@container/main flex min-h-0 flex-1 flex-col overflow-hidden"
            : "@container/main min-h-0 flex-1 overflow-y-auto"
        }
      >
        <div
          className={cn(
            fillViewport
              ? "flex min-h-0 flex-1 flex-col gap-4 pt-4 md:gap-6 md:pt-6"
              : "flex min-h-full flex-col gap-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] md:gap-6 md:pt-6 md:pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
