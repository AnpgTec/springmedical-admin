"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, ZoomIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isStorageObjectKey, productImageUrl } from "@/lib/product-image";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

type Brand = { id: string; slug: string; name_zh_hk: string };

type Product = {
  id?: string;
  brand_id: string;
  slug: string;
  title_zh_hk: string;
  title_zh_cn: string;
  title_en: string;
  description_zh_hk: string;
  description_zh_cn: string;
  description_en: string;
  price_hkd: string;
  stock: string;
  sort: string;
  status: "draft" | "on_sale" | "off";
  image_paths: string[];
};

const empty: Product = {
  brand_id: "",
  slug: "",
  title_zh_hk: "",
  title_zh_cn: "",
  title_en: "",
  description_zh_hk: "",
  description_zh_cn: "",
  description_en: "",
  price_hkd: "",
  stock: "0",
  sort: "0",
  status: "draft",
  image_paths: [],
};

export function ProductForm({ initial }: { initial?: Product }) {
  const router = useRouter();
  const [form, setForm] = useState<Product>(initial || empty);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFiles() {
    fileRef.current?.click();
  }

  useEffect(() => {
    const supabase = createClient();
    void supabase
      .from("brands")
      .select("id, slug, name_zh_hk")
      .order("sort", { ascending: false })
      .then(({ data }) => {
        const list = (data || []) as Brand[];
        setBrands(list);
        setForm((f) => ({ ...f, brand_id: f.brand_id || list[0]?.id || "" }));
      });
  }, []);

  useEffect(() => {
    if (preview === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreview(null);
      if (e.key === "ArrowLeft") setPreview((i) => (i === null || i <= 0 ? i : i - 1));
      if (e.key === "ArrowRight") {
        setPreview((i) => {
          if (i === null) return i;
          return i >= form.image_paths.length - 1 ? i : i + 1;
        });
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [preview, form.image_paths.length]);

  function set<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function extOf(file: File): string {
    const fromName = file.name.split(".").pop()?.toLowerCase();
    if (fromName === "jpeg" || fromName === "jpg") return "jpg";
    if (fromName === "png" || fromName === "webp" || fromName === "gif") return fromName;
    const map: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    };
    return map[file.type] || "jpg";
  }

  async function upload(file: File) {
    if (!ALLOWED_TYPES.has(file.type)) {
      setError("僅接受 JPEG、PNG、WebP 或 GIF。");
      return false;
    }
    if (file.size > MAX_BYTES) {
      setError("圖片不可超過 5 MB。");
      return false;
    }
    const supabase = createClient();
    const folder = form.id || "draft";
    const path = `${folder}/${crypto.randomUUID()}.${extOf(file)}`;
    const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (upErr) {
      setError(upErr.message);
      return false;
    }
    setForm((f) => ({ ...f, image_paths: [...f.image_paths, path] }));
    return true;
  }

  async function uploadMany(files: FileList | File[]) {
    setError("");
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ok = await upload(file);
        if (!ok) break;
      }
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function moveImage(index: number, dir: -1 | 1) {
    setForm((f) => {
      const next = [...f.image_paths];
      const j = index + dir;
      if (j < 0 || j >= next.length) return f;
      const tmp = next[index];
      next[index] = next[j];
      next[j] = tmp;
      return { ...f, image_paths: next };
    });
  }

  async function removeImage(path: string) {
    setError("");
    if (isStorageObjectKey(path)) {
      const supabase = createClient();
      const { error: delErr } = await supabase.storage.from("product-images").remove([path]);
      if (delErr) {
        setError(delErr.message);
        return;
      }
    }
    setForm((f) => ({ ...f, image_paths: f.image_paths.filter((x) => x !== path) }));
  }

  async function save() {
    setError("");
    const price = Number(form.price_hkd);
    if (!form.brand_id || !form.slug.trim()) {
      setError("請填寫品牌與 slug。");
      return;
    }
    if (!form.title_zh_hk || !form.title_zh_cn || !form.title_en) {
      setError("三語標題均為必填。");
      return;
    }
    if (!(price > 0)) {
      setError("價格必須大於 0。");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const payload = {
      brand_id: form.brand_id,
      slug: form.slug.trim(),
      title_zh_hk: form.title_zh_hk,
      title_zh_cn: form.title_zh_cn,
      title_en: form.title_en,
      description_zh_hk: form.description_zh_hk || null,
      description_zh_cn: form.description_zh_cn || null,
      description_en: form.description_en || null,
      price_hkd: price > 0 ? price : 0.01,
      stock: Math.max(0, parseInt(form.stock, 10) || 0),
      sort: Number(form.sort) || 0,
      status: form.status,
      image_paths: form.image_paths,
    };
    const q = form.id
      ? supabase.from("products").update(payload).eq("id", form.id)
      : supabase.from("products").insert(payload);
    const { error: dbErr } = await q;
    if (dbErr) {
      setPending(false);
      setError(dbErr.message);
      return;
    }
    setSaved(true);
    window.setTimeout(() => {
      router.push("/products");
      router.refresh();
    }, 1200);
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>品牌</Label>
          <Select value={form.brand_id} onChange={(e) => set("brand_id", e.target.value)}>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name_zh_hk}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Slug（URL）</Label>
          <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>標題 繁中 *</Label>
          <Input value={form.title_zh_hk} onChange={(e) => set("title_zh_hk", e.target.value)} />
        </div>
        <div>
          <Label>標題 簡中 *</Label>
          <Input value={form.title_zh_cn} onChange={(e) => set("title_zh_cn", e.target.value)} />
        </div>
        <div>
          <Label>標題 English *</Label>
          <Input value={form.title_en} onChange={(e) => set("title_en", e.target.value)} />
        </div>
      </div>
      <div>
        <Label>描述 繁中</Label>
        <Textarea value={form.description_zh_hk} onChange={(e) => set("description_zh_hk", e.target.value)} />
      </div>
      <div>
        <Label>描述 簡中</Label>
        <Textarea value={form.description_zh_cn} onChange={(e) => set("description_zh_cn", e.target.value)} />
      </div>
      <div>
        <Label>描述 English</Label>
        <Textarea value={form.description_en} onChange={(e) => set("description_en", e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <Label>價格 HKD</Label>
          <Input type="number" min="0.01" step="0.01" value={form.price_hkd} onChange={(e) => set("price_hkd", e.target.value)} />
        </div>
        <div>
          <Label>庫存</Label>
          <Input type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
        </div>
        <div>
          <Label>排序</Label>
          <Input type="number" value={form.sort} onChange={(e) => set("sort", e.target.value)} />
        </div>
        <div>
          <Label>狀態</Label>
          <Select value={form.status} onChange={(e) => set("status", e.target.value as Product["status"])}>
            <option value="draft">草稿</option>
            <option value="on_sale">上架</option>
            <option value="off">下架</option>
          </Select>
        </div>
      </div>
      <div>
        <Label>商品圖（第一張為列表封面，詳情頁可輪播）</Label>
        <p className="mt-1 text-xs text-[var(--muted)]">
          點擊「上傳」方塊選擇圖片，也可拖曳到該方塊。點擊縮略圖可放大預覽。JPEG / PNG / WebP / GIF，單張上限 5 MB。
        </p>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const files = e.target.files;
            if (files?.length) void uploadMany(files);
          }}
        />
        {uploading ? <p className="mt-2 text-xs text-[var(--muted)]">上傳中…</p> : null}
        <div className="mt-3 flex flex-wrap gap-3">
          {form.image_paths.map((p, i) => {
            const src = productImageUrl(p);
            return (
              <div key={p} className="relative w-24">
                {src ? (
                  <button
                    type="button"
                    className="group relative block"
                    onClick={() => setPreview(i)}
                    aria-label={i === 0 ? "放大封面圖" : `放大第 ${i + 1} 張圖`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-24 w-24 rounded border border-[var(--line)] object-cover"
                    />
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded bg-black/0 transition group-hover:bg-black/35">
                      <ZoomIn
                        size={18}
                        className="text-white opacity-0 drop-shadow transition group-hover:opacity-100"
                      />
                    </span>
                  </button>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded border border-[var(--line)] text-[10px] text-[var(--muted)]">
                    無預覽
                  </div>
                )}
                {i === 0 ? (
                  <span className="pointer-events-none absolute left-1 top-1 rounded bg-[var(--ink)] px-1 text-[10px] text-white">
                    封面
                  </span>
                ) : null}
                <div className="mt-1 flex justify-center gap-1">
                  <button type="button" className="text-xs text-[var(--muted)]" disabled={i === 0} onClick={() => moveImage(i, -1)}>
                    ←
                  </button>
                  <button
                    type="button"
                    className="text-xs text-[var(--muted)]"
                    disabled={i === form.image_paths.length - 1}
                    onClick={() => moveImage(i, 1)}
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--ink)] text-xs text-white"
                  onClick={() => void removeImage(p)}
                  aria-label="移除圖片"
                >
                  ×
                </button>
              </div>
            );
          })}
          <button
            type="button"
            disabled={uploading}
            onClick={pickFiles}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files.length) void uploadMany(e.dataTransfer.files);
            }}
            className={
              dragOver
                ? "flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[var(--gold)] bg-[var(--gold)] text-white"
                : "flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-[var(--gold)] bg-[var(--gold-soft)] text-[var(--gold)] hover:brightness-95 disabled:opacity-50"
            }
            aria-label="上傳圖片"
          >
            <ImagePlus size={22} />
            <span className="text-[11px] font-medium">{uploading ? "上傳中" : "上傳"}</span>
          </button>
        </div>
      </div>
      {preview !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6"
          role="dialog"
          aria-modal="true"
          aria-label="商品圖預覽"
          onClick={() => setPreview(null)}
        >
          <button
            type="button"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg text-[var(--ink)]"
            aria-label="關閉"
            onClick={() => setPreview(null)}
          >
            ×
          </button>
          {form.image_paths.length > 1 ? (
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg text-[var(--ink)] disabled:opacity-40"
              aria-label="上一張"
              disabled={preview <= 0}
              onClick={(e) => {
                e.stopPropagation();
                setPreview((i) => (i === null ? i : Math.max(0, i - 1)));
              }}
            >
              ‹
            </button>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productImageUrl(form.image_paths[preview]) || ""}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded object-contain shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
          {form.image_paths.length > 1 ? (
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-lg text-[var(--ink)] disabled:opacity-40"
              aria-label="下一張"
              disabled={preview >= form.image_paths.length - 1}
              onClick={(e) => {
                e.stopPropagation();
                setPreview((i) =>
                  i === null ? i : Math.min(form.image_paths.length - 1, i + 1)
                );
              }}
            >
              ›
            </button>
          ) : null}
          <div className="absolute bottom-5 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
            {preview === 0 ? "封面 · " : ""}
            {preview + 1} / {form.image_paths.length}
            <span className="ml-2 text-white/70">點背景或 Esc 關閉</span>
          </div>
        </div>
      ) : null}
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      {saved ? <p className="text-sm text-emerald-700">已儲存，即將返回商品列表…</p> : null}
      <div className="flex gap-2">
        <Button type="button" disabled={pending || uploading || saved} onClick={() => void save()}>
          {saved ? "已儲存" : pending ? "儲存中…" : "儲存"}
        </Button>
        <Button type="button" variant="outline" disabled={saved} onClick={() => router.push("/products")}>
          返回商品列表
        </Button>
      </div>
    </div>
  );
}
