import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-4xl">編輯商品</h1>
        <Link
          href="/products"
          className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm"
        >
          返回商品列表
        </Link>
      </div>
      <ProductForm
        initial={{
          id: data.id,
          brand_id: data.brand_id,
          slug: data.slug,
          title_zh_hk: data.title_zh_hk,
          title_zh_cn: data.title_zh_cn,
          title_en: data.title_en,
          description_zh_hk: data.description_zh_hk || "",
          description_zh_cn: data.description_zh_cn || "",
          description_en: data.description_en || "",
          price_hkd: String(data.price_hkd),
          stock: String(data.stock),
          sort: String(data.sort ?? 0),
          status: data.status,
          image_paths: Array.isArray(data.image_paths) ? data.image_paths : [],
        }}
      />
    </div>
  );
}
