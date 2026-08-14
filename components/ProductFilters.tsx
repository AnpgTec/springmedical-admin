"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type BrandOption = { id: string; name_zh_hk: string };

const STATUSES = [
  { value: "on_sale", label: "上架" },
  { value: "draft", label: "草稿" },
  { value: "off", label: "下架" },
] as const;

function buildQuery(brand: string, status: string, q: string) {
  const params = new URLSearchParams();
  if (brand) params.set("brand", brand);
  if (status) params.set("status", status);
  if (q.trim()) params.set("q", q.trim());
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function ProductFilters({ brands }: { brands: BrandOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const brand = searchParams.get("brand") ?? "";
  const status = searchParams.get("status") ?? "";
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  function go(nextBrand: string, nextStatus: string, nextQ: string) {
    router.push(`${pathname}${buildQuery(nextBrand, nextStatus, nextQ)}`);
  }

  return (
    <form
      className="mt-6 flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        go(brand, status, q);
      }}
    >
      <div className="w-52">
        <Label htmlFor="filter-brand">品牌</Label>
        <Select id="filter-brand" value={brand} onChange={(e) => go(e.target.value, status, q)}>
          <option value="">全部品牌</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name_zh_hk}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-40">
        <Label htmlFor="filter-status">狀態</Label>
        <Select id="filter-status" value={status} onChange={(e) => go(brand, e.target.value, q)}>
          <option value="">全部狀態</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="min-w-[240px] flex-1">
        <Label htmlFor="filter-q">Slug / 標題</Label>
        <Input
          id="filter-q"
          value={q}
          placeholder="搜尋 slug、繁中、簡中、英文標題"
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <Button type="submit">搜尋</Button>
      {brand || status || searchParams.get("q") ? (
        <Button type="button" variant="outline" onClick={() => router.push(pathname)}>
          清除
        </Button>
      ) : null}
    </form>
  );
}
