"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_OPTIONS } from "@/lib/order-meta";

function buildQuery(status: string, fulfillment: string, payment: string, q: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (fulfillment) params.set("fulfillment", fulfillment);
  if (payment) params.set("payment", payment);
  if (q.trim()) params.set("q", q.trim());
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function OrderFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "";
  const fulfillment = searchParams.get("fulfillment") ?? "";
  const payment = searchParams.get("payment") ?? "";
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  function go(nextStatus: string, nextFulfillment: string, nextPayment: string, nextQ: string) {
    router.push(`${pathname}${buildQuery(nextStatus, nextFulfillment, nextPayment, nextQ)}`);
  }

  const hasFilter = Boolean(status || fulfillment || payment || searchParams.get("q"));

  return (
    <form
      className="mt-6 flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        go(status, fulfillment, payment, q);
      }}
    >
      <div className="w-40">
        <Label htmlFor="filter-status">狀態</Label>
        <Select
          id="filter-status"
          value={status}
          onChange={(e) => go(e.target.value, fulfillment, payment, q)}
        >
          <option value="">全部狀態</option>
          {ORDER_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-40">
        <Label htmlFor="filter-fulfillment">取貨 / 配送</Label>
        <Select
          id="filter-fulfillment"
          value={fulfillment}
          onChange={(e) => go(status, e.target.value, payment, q)}
        >
          <option value="">全部方式</option>
          <option value="pickup">自行取貨</option>
          <option value="delivery">郵寄配送</option>
        </Select>
      </div>
      <div className="w-40">
        <Label htmlFor="filter-payment">支付</Label>
        <Select
          id="filter-payment"
          value={payment}
          onChange={(e) => go(status, fulfillment, e.target.value, q)}
        >
          <option value="">全部支付</option>
          <option value="in_store">到店支付</option>
          <option value="paypal">PayPal</option>
        </Select>
      </div>
      <div className="min-w-[240px] flex-1">
        <Label htmlFor="filter-q">單號 / 顧客</Label>
        <Input
          id="filter-q"
          value={q}
          placeholder="搜尋單號、姓名、電郵、電話"
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <Button type="submit">搜尋</Button>
      {hasFilter ? (
        <Button type="button" variant="outline" onClick={() => router.push(pathname)}>
          清除
        </Button>
      ) : null}
    </form>
  );
}
