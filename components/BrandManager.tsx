"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/card";
import { formatDt } from "@/lib/utils";

type Brand = {
  id: string;
  slug: string;
  name_zh_hk: string;
  name_zh_cn: string;
  name_en: string;
  sort: number;
  status: number;
  created_at: string;
  updated_at: string;
};

const emptyForm = { slug: "", name_zh_hk: "", name_zh_cn: "", name_en: "", sort: "0" };

function toForm(b: Brand) {
  return {
    slug: b.slug,
    name_zh_hk: b.name_zh_hk,
    name_zh_cn: b.name_zh_cn,
    name_en: b.name_en,
    sort: String(b.sort),
  };
}

export function BrandManager({ initial }: { initial: Brand[] }) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  function startEdit(b: Brand) {
    setEditingId(b.id);
    setForm(toForm(b));
    setError("");
  }

  async function save() {
    setError("");
    if (!form.slug.trim() || !form.name_zh_hk.trim() || !form.name_zh_cn.trim() || !form.name_en.trim()) {
      setError("請填齊 slug 與三語名稱。");
      return;
    }
    setPending(true);
    const supabase = createClient();
    const payload = {
      slug: form.slug.trim(),
      name_zh_hk: form.name_zh_hk.trim(),
      name_zh_cn: form.name_zh_cn.trim(),
      name_en: form.name_en.trim(),
      sort: Number(form.sort) || 0,
    };

    if (editingId) {
      const { data, error: dbErr } = await supabase
        .from("brands")
        .update(payload)
        .eq("id", editingId)
        .select("id, slug, name_zh_hk, name_zh_cn, name_en, sort, status, created_at, updated_at")
        .single();
      setPending(false);
      if (dbErr) {
        setError(dbErr.message);
        return;
      }
      setList((l) => l.map((x) => (x.id === editingId ? (data as Brand) : x)));
      resetForm();
      router.refresh();
      return;
    }

    const { data, error: dbErr } = await supabase
      .from("brands")
      .insert({ ...payload, status: 1 })
      .select("id, slug, name_zh_hk, name_zh_cn, name_en, sort, status, created_at, updated_at")
      .single();
    setPending(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    setList((l) => [data as Brand, ...l]);
    resetForm();
    router.refresh();
  }

  async function toggle(b: Brand) {
    const supabase = createClient();
    const next = b.status === 1 ? 0 : 1;
    const { data } = await supabase
      .from("brands")
      .update({ status: next })
      .eq("id", b.id)
      .select("updated_at")
      .single();
    setList((l) =>
      l.map((x) =>
        x.id === b.id ? { ...x, status: next, updated_at: data?.updated_at ?? x.updated_at } : x
      )
    );
  }

  return (
    <div>
      <div className="mb-2 text-sm text-[var(--muted)]">
        {editingId ? "正在編輯品牌，儲存後會更新列表。" : "填寫後新增品牌。也可從列表點「編輯」。"}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <Label>Slug</Label>
          <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </div>
        <div>
          <Label>繁中</Label>
          <Input value={form.name_zh_hk} onChange={(e) => setForm({ ...form, name_zh_hk: e.target.value })} />
        </div>
        <div>
          <Label>簡中</Label>
          <Input value={form.name_zh_cn} onChange={(e) => setForm({ ...form, name_zh_cn: e.target.value })} />
        </div>
        <div>
          <Label>English</Label>
          <Input value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
        </div>
        <div>
          <Label>排序</Label>
          <Input
            type="number"
            value={form.sort}
            onChange={(e) => setForm({ ...form, sort: e.target.value })}
          />
        </div>
      </div>
      {error ? <p className="mt-2 text-sm text-[var(--danger)]">{error}</p> : null}
      <div className="mt-4 flex gap-2">
        <Button type="button" disabled={pending} onClick={() => void save()}>
          {pending ? "儲存中…" : editingId ? "儲存修改" : "新增品牌"}
        </Button>
        {editingId ? (
          <Button type="button" variant="outline" disabled={pending} onClick={resetForm}>
            取消
          </Button>
        ) : null}
      </div>
      <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-[var(--bg)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">繁中</th>
              <th className="px-4 py-3">簡中</th>
              <th className="px-4 py-3">English</th>
              <th className="px-4 py-3">排序</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3">建立時間</th>
              <th className="px-4 py-3">更新時間</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((b) => (
              <tr
                key={b.id}
                className={
                  editingId === b.id
                    ? "border-t border-[var(--line)] bg-[var(--gold-soft)]"
                    : "border-t border-[var(--line)]"
                }
              >
                <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{b.id}</td>
                <td className="px-4 py-3">{b.slug}</td>
                <td className="px-4 py-3">{b.name_zh_hk}</td>
                <td className="px-4 py-3">{b.name_zh_cn}</td>
                <td className="px-4 py-3">{b.name_en}</td>
                <td className="px-4 py-3">{b.sort}</td>
                <td className="px-4 py-3">
                  <Badge tone={b.status === 1 ? "ok" : "neutral"}>{b.status === 1 ? "啟用" : "停用"}</Badge>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[var(--muted)]">{formatDt(b.created_at)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-[var(--muted)]">{formatDt(b.updated_at)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button type="button" className="mr-3 text-[var(--gold)]" onClick={() => startEdit(b)}>
                    編輯
                  </button>
                  <button type="button" className="text-[var(--gold)]" onClick={() => void toggle(b)}>
                    {b.status === 1 ? "停用" : "啟用"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
