import { SiteHeader } from "@/components/templates/SiteHeader/site-header";
import { cn } from "@/shared/lib/utils";

type AppPageProps = {
  title: string;
  rightContent?: React.ReactNode;
  children: React.ReactNode;
  contentClassName?: string;
};

export function AppPage({
  title,
  rightContent,
  children,
  contentClassName = "px-4 lg:px-6",
}: AppPageProps) {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <SiteHeader title={title} rightContent={rightContent} />
      <div className="@container/main min-h-0 flex-1 overflow-y-auto">
        <div
          className={cn(
            "flex flex-col gap-4 py-4 md:gap-6 md:py-6",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
