import Link from "next/link";
import { ProductForm } from "@/components/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-4xl">新增商品</h1>
        <Link
          href="/products"
          className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-sm"
        >
          返回商品列表
        </Link>
      </div>
      <ProductForm />
    </div>
  );
}
