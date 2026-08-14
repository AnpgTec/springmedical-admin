import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/card";
import { ProductFilters } from "@/components/ProductFilters";
import { formatDt, formatHKD } from "@/lib/utils";

function sanitizeSearch(raw: string) {
  return raw.replace(/[%_,.()\\'"]/g, " ").replace(/\s+/g, " ").trim();
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; q?: string; status?: string }>;
}) {
  const { brand, q, status } = await searchParams;
  const supabase = await createClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name_zh_hk")
    .order("sort", { ascending: false });

  let query = supabase
    .from("products")
    .select(
      "id, slug, title_zh_hk, title_zh_cn, title_en, price_hkd, stock, sort, status, updated_at, brands(name_zh_hk)"
    )
    .order("sort", { ascending: false })
    .order("updated_at", { ascending: false });

  const brandIds = new Set((brands || []).map((b) => b.id));
  if (brand && brandIds.has(brand)) {
    query = query.eq("brand_id", brand);
  }

  if (status === "on_sale" || status === "draft" || status === "off") {
    query = query.eq("status", status);
  }

  const keyword = sanitizeSearch(q || "");
  if (keyword) {
    const pattern = `"%${keyword}%"`;
    query = query.or(
      `slug.ilike.${pattern},title_zh_hk.ilike.${pattern},title_zh_cn.ilike.${pattern},title_en.ilike.${pattern}`
    );
  }

  const { data: products } = await query;
  const rows = products || [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl">商品</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">上架前須填齊繁/簡/英標題。</p>
        </div>
        <div className="flex gap-2">
          <Link href="/products/new" className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm text-white">
            新增商品
          </Link>
        </div>
      </div>
      <ProductFilters brands={brands || []} />
      <p className="mt-3 text-sm text-[var(--muted)]">共 {rows.length} 件</p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-[var(--bg)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">ID / Slug</th>
              <th className="px-4 py-3">品牌</th>
              <th className="px-4 py-3">繁中</th>
              <th className="px-4 py-3">簡中</th>
              <th className="px-4 py-3">English</th>
              <th className="px-4 py-3">價格</th>
              <th className="px-4 py-3">庫存</th>
              <th className="px-4 py-3">排序</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3">更新時間</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-10 text-center text-[var(--muted)]">
                  沒有符合條件的商品
                </td>
              </tr>
            ) : (
              rows.map((p) => {
                const brandRow = Array.isArray(p.brands) ? p.brands[0] : p.brands;
                return (
                  <tr key={p.id} className="border-t border-[var(--line)]">
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                            ID
                          </span>
                          <span className="font-mono text-xs text-[var(--muted)]">{p.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="shrink-0 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium text-[var(--muted)]">
                            Slug
                          </span>
                          <span>{p.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{brandRow?.name_zh_hk ?? "—"}</td>
                    <td className="px-4 py-3">{p.title_zh_hk}</td>
                    <td className="px-4 py-3">{p.title_zh_cn}</td>
                    <td className="px-4 py-3">{p.title_en}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatHKD(p.price_hkd)}</td>
                    <td className="px-4 py-3">{p.stock}</td>
                    <td className="px-4 py-3">{p.sort}</td>
                    <td className="px-4 py-3">
                      <Badge tone={p.status === "on_sale" ? "ok" : p.status === "draft" ? "warn" : "neutral"}>
                        {p.status === "on_sale" ? "上架" : p.status === "draft" ? "草稿" : "下架"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--muted)]">{formatDt(p.updated_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Link href={`/products/${p.id}`} className="text-[var(--gold)] hover:underline">
                        編輯
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
