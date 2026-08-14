import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/card";
import { OrderFilters } from "@/components/OrderFilters";
import { formatDt, formatHKD } from "@/lib/utils";
import {
  addressDistrict,
  fulfillmentLabel,
  isFulfillment,
  isOrderStatus,
  isPaymentMethod,
  orderStatusMeta,
  paymentMethodLabel,
} from "@/lib/order-meta";

function sanitizeSearch(raw: string) {
  return raw.replace(/[,()\\'"]/g, "").replace(/\s+/g, " ").trim();
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; fulfillment?: string; payment?: string; q?: string }>;
}) {
  const { status, fulfillment, payment, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      "id, order_no, status, amount_hkd, customer_name, email, phone, fulfillment, payment_method, address_json, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && isOrderStatus(status)) {
    query = query.eq("status", status);
  }
  if (fulfillment && isFulfillment(fulfillment)) {
    query = query.eq("fulfillment", fulfillment);
  }
  if (payment && isPaymentMethod(payment)) {
    query = query.eq("payment_method", payment);
  }

  const keyword = sanitizeSearch(q || "");
  if (keyword) {
    const pattern = `"%${keyword}%"`;
    query = query.or(
      `order_no.ilike.${pattern},customer_name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`
    );
  }

  const { data: orders } = await query;
  const rows = orders || [];

  return (
    <div>
      <h1 className="text-4xl">訂單</h1>
      <OrderFilters />
      <p className="mt-3 text-sm text-[var(--muted)]">共 {rows.length} 筆</p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-[var(--bg)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">單號</th>
              <th className="px-4 py-3">顧客</th>
              <th className="px-4 py-3">金額</th>
              <th className="px-4 py-3">履約</th>
              <th className="px-4 py-3">支付</th>
              <th className="px-4 py-3">地區</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3">下單時間</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-[var(--muted)]">
                  沒有符合條件的訂單
                </td>
              </tr>
            ) : (
              rows.map((o) => {
                const meta = orderStatusMeta(o.status);
                return (
                  <tr key={o.id} className="border-t border-[var(--line)]">
                    <td className="px-4 py-3">
                      <Link href={`/orders/${o.id}`} className="hover:underline">
                        {o.order_no}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {o.customer_name}
                      <div className="text-xs text-[var(--muted)]">{o.email}</div>
                      <div className="text-xs text-[var(--muted)]">{o.phone}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatHKD(o.amount_hkd)}</td>
                    <td className="px-4 py-3">{fulfillmentLabel(o.fulfillment)}</td>
                    <td className="px-4 py-3">{paymentMethodLabel(o.payment_method)}</td>
                    <td className="px-4 py-3">{o.fulfillment === "delivery" ? addressDistrict(o.address_json) : "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--muted)]">{formatDt(o.created_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/orders/${o.id}`} className="text-[var(--gold)] hover:underline">
                        詳情
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
