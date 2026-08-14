import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ count: products }, { count: orders }, { count: pending }, { count: leads }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending_payment"),
      supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    ]);

  const tiles = [
    { label: "商品", value: products ?? 0, href: "/products" },
    { label: "訂單", value: orders ?? 0, href: "/orders" },
    { label: "待支付", value: pending ?? 0, href: "/orders" },
    { label: "新預約", value: leads ?? 0, href: "/leads" },
  ];

  return (
    <div>
      <h1 className="text-4xl">總覽</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">僅管理商城、訂單、支付與預約。</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href}>
            <Card className="hover:border-[var(--gold)]">
              <div className="text-sm text-[var(--muted)]">{t.label}</div>
              <div className="mt-2 font-serif text-4xl">{t.value}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
