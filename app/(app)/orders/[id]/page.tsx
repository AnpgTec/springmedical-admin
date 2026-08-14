import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusForm } from "@/components/OrderStatusForm";
import { Badge } from "@/components/ui/card";
import { formatDt, formatHKD } from "@/lib/utils";
import {
  addressSummary,
  fulfillmentLabel,
  orderStatusMeta,
  paymentMethodLabel,
} from "@/lib/order-meta";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  if (!order) notFound();
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
  const { data: payments } = await supabase.from("payments").select("*").eq("order_id", id);
  const meta = orderStatusMeta(order.status);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl">{order.order_no}</h1>
          <div className="mt-2">
            <Badge tone={meta.tone}>{meta.label}</Badge>
          </div>
        </div>
        <Link
          href="/orders"
          className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm"
        >
          返回訂單列表
        </Link>
      </div>

      <dl className="grid max-w-3xl gap-3 rounded-xl border border-[var(--line)] bg-white p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-[var(--muted)]">顧客</dt>
          <dd>{order.customer_name}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--muted)]">電郵</dt>
          <dd>{order.email}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--muted)]">電話</dt>
          <dd>{order.phone}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--muted)]">金額</dt>
          <dd className="text-lg">{formatHKD(order.amount_hkd)}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--muted)]">履約</dt>
          <dd>{fulfillmentLabel(order.fulfillment)}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--muted)]">支付</dt>
          <dd>{paymentMethodLabel(order.payment_method)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-[var(--muted)]">地址</dt>
          <dd>{order.fulfillment === "delivery" ? addressSummary(order.address_json) : "自行取貨，無需地址"}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--muted)]">下單時間</dt>
          <dd>{formatDt(order.created_at)}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--muted)]">付款時間</dt>
          <dd>{formatDt(order.paid_at)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-[var(--muted)]">顧客備註</dt>
          <dd>{order.note || "—"}</dd>
        </div>
      </dl>

      <OrderStatusForm orderId={order.id} status={order.status} adminNote={order.admin_note} />

      <h2 className="mt-8 text-2xl">明細</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {(items || []).length === 0 ? <li className="text-[var(--muted)]">暫無</li> : null}
        {(items || []).map((it) => (
          <li key={it.id}>
            {it.title_snapshot_zh_hk} × {it.qty} — {formatHKD(it.line_amount_hkd)}
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-2xl">支付記錄</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {(payments || []).length === 0 ? <li className="text-[var(--muted)]">暫無</li> : null}
        {(payments || []).map((p) => (
          <li key={p.id}>
            {p.provider} · {p.status} · {p.provider_order_id || "—"} · {formatHKD(p.amount_hkd)}
          </li>
        ))}
      </ul>
    </div>
  );
}
