import { BrandManager } from "@/components/BrandManager";
import { createClient } from "@/lib/supabase/server";

export default async function BrandsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brands")
    .select("id, slug, name_zh_hk, name_zh_cn, name_en, sort, status, created_at, updated_at")
    .order("sort", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-4xl">品牌</h1>
      <BrandManager initial={data || []} />
    </div>
  );
}
