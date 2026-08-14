"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/card";
import { formatDt } from "@/lib/utils";

type Row = {
  id: string;
  display_name: string;
  role: string;
  status: number;
  created_at: string;
  email?: string;
};

const emptyForm = { email: "", password: "", display_name: "", role: "operator" };

export function AdminList({ initial, selfId }: { initial: Row[]; selfId: string }) {
  const router = useRouter();
  const [list, setList] = useState(initial);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [pending, setPending] = useState(false);
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPw, setResetPw] = useState("");
  const [resetPending, setResetPending] = useState(false);

  async function add() {
    setError("");
    setOk("");
    if (!form.email.trim() || !form.display_name.trim() || !form.password) {
      setError("請填寫電郵、顯示名與密碼。");
      return;
    }
    if (form.password.length < 8) {
      setError("密碼至少 8 位。");
      return;
    }
    setPending(true);
    const res = await fetch("/api/admins/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email.trim(),
        password: form.password,
        display_name: form.display_name.trim(),
        role: form.role,
      }),
    });
    const data = (await res.json()) as { error?: string; profile?: Row };
    setPending(false);
    if (!res.ok || !data.profile) {
      setError(data.error || "建立失敗。");
      return;
    }
    setList((l) => [data.profile as Row, ...l]);
    setForm(emptyForm);
    setOk(`已建立 ${data.profile.email || form.email}，請把登入電郵與密碼交給對方。`);
    router.refresh();
  }

  async function toggle(row: Row) {
    setError("");
    if (row.id === selfId) {
      setError("不能停用自己的帳號。");
      return;
    }
    const supabase = createClient();
    const next = row.status === 1 ? 0 : 1;
    const { error: dbErr } = await supabase.from("admin_profiles").update({ status: next }).eq("id", row.id);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    setList((l) => l.map((x) => (x.id === row.id ? { ...x, status: next } : x)));
  }

  async function resetPassword(row: Row) {
    setError("");
    setOk("");
    if (resetPw.length < 8) {
      setError("密碼至少 8 位。");
      return;
    }
    setResetPending(true);
    const res = await fetch("/api/admins/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, password: resetPw }),
    });
    const data = (await res.json()) as { error?: string };
    setResetPending(false);
    if (!res.ok) {
      setError(data.error || "重置密碼失敗。");
      return;
    }
    setResetId(null);
    setResetPw("");
    setOk(`已重置 ${row.email || row.display_name} 的密碼，請把新密碼交給對方。`);
  }

  return (
    <div>
      <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
        <div>
          <Label>電郵（登入帳號）</Label>
          <Input
            type="email"
            autoComplete="off"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label>初始密碼</Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div>
          <Label>顯示名</Label>
          <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} />
        </div>
        <div>
          <Label>角色</Label>
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="operator">運營</option>
            <option value="admin">超管</option>
          </Select>
        </div>
      </div>
      {error ? <p className="mt-2 text-sm text-[var(--danger)]">{error}</p> : null}
      {ok ? <p className="mt-2 text-sm text-emerald-700">{ok}</p> : null}
      <Button className="mt-4" type="button" disabled={pending} onClick={() => void add()}>
        {pending ? "建立中…" : "建立帳號"}
      </Button>
      <div className="mt-8 overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--bg)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">名稱</th>
              <th className="px-4 py-3">電郵</th>
              <th className="px-4 py-3">角色</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3">建立</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className="border-t border-[var(--line)]">
                <td className="px-4 py-3">{r.display_name}</td>
                <td className="px-4 py-3">{r.email || "—"}</td>
                <td className="px-4 py-3">{r.role === "admin" ? "超管" : "運營"}</td>
                <td className="px-4 py-3">
                  <Badge tone={r.status === 1 ? "ok" : "neutral"}>{r.status === 1 ? "啟用" : "停用"}</Badge>
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">{formatDt(r.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-start gap-2">
                    <div className="flex gap-3">
                      {r.id === selfId ? (
                        <span className="text-xs text-[var(--muted)]">目前帳號</span>
                      ) : (
                        <button type="button" className="text-[var(--gold)]" onClick={() => void toggle(r)}>
                          {r.status === 1 ? "停用" : "啟用"}
                        </button>
                      )}
                      <button
                        type="button"
                        className="text-[var(--gold)]"
                        onClick={() => {
                          setError("");
                          setOk("");
                          setResetId(resetId === r.id ? null : r.id);
                          setResetPw("");
                        }}
                      >
                        重置密碼
                      </button>
                    </div>
                    {resetId === r.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <Input
                          type="password"
                          autoComplete="new-password"
                          className="h-8 w-44"
                          placeholder="新密碼（至少 8 位）"
                          value={resetPw}
                          onChange={(e) => setResetPw(e.target.value)}
                        />
                        <Button
                          type="button"
                          size="sm"
                          disabled={resetPending}
                          onClick={() => void resetPassword(r)}
                        >
                          {resetPending ? "儲存中…" : "確認"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={resetPending}
                          onClick={() => {
                            setResetId(null);
                            setResetPw("");
                          }}
                        >
                          取消
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
