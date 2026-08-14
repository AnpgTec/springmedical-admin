import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/card";
import { formatDt, formatHKD } from "@/lib/utils";

const tone: Record<string, "ok" | "warn" | "danger" | "neutral"> = {
  created: "warn",
  completed: "ok",
  failed: "danger",
  refunded: "neutral",
};

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("id, provider, provider_order_id, provider_capture_id, amount_hkd, status, created_at, orders(order_no)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="text-4xl">支付</h1>
      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">訂單</th>
              <th className="px-4 py-3">PayPal Order</th>
              <th className="px-4 py-3">Capture</th>
              <th className="px-4 py-3">金額</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3">時間</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((p) => {
              const order = Array.isArray(p.orders) ? p.orders[0] : p.orders;
              return (
                <tr key={p.id} className="border-t border-[var(--line)]">
                  <td className="px-4 py-3">{order?.order_no ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.provider_order_id}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.provider_capture_id || "—"}</td>
                  <td className="px-4 py-3">{formatHKD(p.amount_hkd)}</td>
                  <td className="px-4 py-3">
                    <Badge tone={tone[p.status] || "neutral"}>{p.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">{formatDt(p.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
