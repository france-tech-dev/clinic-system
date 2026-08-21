import ThemeSwitcher from "@/components/templates/ThemeSwitcher/ThemeSwitcher";

export function PublicInviteUnavailable({
  title = "Link indisponível",
  description = "Este link é inválido, expirou ou foi revogado.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-8">
        <div className="flex justify-end">
          <ThemeSwitcher />
        </div>
        <div className="rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
