export function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="font-serif text-3xl font-semibold text-primary">{number}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
