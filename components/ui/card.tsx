import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-[var(--line)] bg-[var(--card)] p-5 shadow-sm", className)}
      {...props}
    />
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "warn" | "danger" | "gold";
}) {
  const map = {
    neutral: "bg-stone-100 text-stone-700",
    ok: "bg-emerald-50 text-emerald-800",
    warn: "bg-amber-50 text-amber-800",
    danger: "bg-red-50 text-red-800",
    gold: "bg-[var(--gold-soft)] text-[var(--gold)]",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", map[tone])}>
      {children}
    </span>
  );
}
