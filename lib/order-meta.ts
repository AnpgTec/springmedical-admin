export const ORDER_STATUS_OPTIONS = [
  { value: "pending_payment", label: "待支付", tone: "warn" as const },
  { value: "paid", label: "已支付", tone: "ok" as const },
  { value: "fulfilled", label: "已履約", tone: "ok" as const },
  { value: "cancelled", label: "已取消", tone: "neutral" as const },
  { value: "refunded", label: "已退款", tone: "danger" as const },
];

const STATUS_SET = new Set<string>(ORDER_STATUS_OPTIONS.map((s) => s.value));

export function isOrderStatus(value: string) {
  return STATUS_SET.has(value);
}

export function orderStatusMeta(status: string) {
  return (
    ORDER_STATUS_OPTIONS.find((s) => s.value === status) || {
      value: status,
      label: status,
      tone: "neutral" as const,
    }
  );
}

export function fulfillmentLabel(value: string) {
  return value === "delivery" ? "郵寄配送" : "自行取貨";
}

export function paymentMethodLabel(value: string) {
  return value === "paypal" ? "PayPal" : "到店支付";
}

export function isFulfillment(value: string) {
  return value === "pickup" || value === "delivery";
}

export function isPaymentMethod(value: string) {
  return value === "in_store" || value === "paypal";
}

type AddressJson = {
  line1?: string;
  line2?: string;
  district?: string;
  region?: string;
  postal_code?: string;
};

export function addressDistrict(json: unknown) {
  if (!json || typeof json !== "object") return "—";
  const district = (json as AddressJson).district?.trim();
  return district || "—";
}

export function addressSummary(json: unknown) {
  if (!json || typeof json !== "object") return "—";
  const a = json as AddressJson;
  const parts = [a.district, a.line1, a.line2, a.postal_code].filter((x) => x && String(x).trim());
  return parts.length ? parts.join(" · ") : "—";
}
