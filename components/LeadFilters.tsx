"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LEAD_SOURCE_OPTIONS, LEAD_STATUS_OPTIONS } from "@/lib/lead-meta";

function buildQuery(status: string, source: string, q: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (source) params.set("source", source);
  if (q.trim()) params.set("q", q.trim());
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function LeadFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "";
  const source = searchParams.get("source") ?? "";
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  function go(nextStatus: string, nextSource: string, nextQ: string) {
    router.push(`${pathname}${buildQuery(nextStatus, nextSource, nextQ)}`);
  }

  const hasFilter = Boolean(status || source || searchParams.get("q"));

  return (
    <form
      className="mt-6 flex flex-wrap items-end gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        go(status, source, q);
      }}
    >
      <div className="w-40">
        <Label htmlFor="filter-status">狀態</Label>
        <Select id="filter-status" value={status} onChange={(e) => go(e.target.value, source, q)}>
          <option value="">全部狀態</option>
          {LEAD_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-40">
        <Label htmlFor="filter-source">來源</Label>
        <Select id="filter-source" value={source} onChange={(e) => go(status, e.target.value, q)}>
          <option value="">全部來源</option>
          {LEAD_SOURCE_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="min-w-[240px] flex-1">
        <Label htmlFor="filter-q">姓名 / 聯絡 / 意向</Label>
        <Input
          id="filter-q"
          value={q}
          placeholder="搜尋姓名、電郵、電話、意向"
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
