"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/input";
import { ORDER_STATUS_OPTIONS } from "@/lib/order-meta";

export function OrderStatusForm({
  orderId,
  status,
  adminNote,
}: {
  orderId: string;
  status: string;
  adminNote?: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [note, setNote] = useState(adminNote || "");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setPending(true);
    setSaved(false);
    setError("");
    const supabase = createClient();
    const { error: dbErr } = await supabase
      .from("orders")
      .update({ status: value, admin_note: note.trim() || null })
      .eq("id", orderId);
    setPending(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="mt-6 max-w-md space-y-3 rounded-xl border border-[var(--line)] bg-white p-5">
      <h2 className="text-lg">修改訂單狀態</h2>
      <div>
        <Label>狀態</Label>
        <Select value={value} onChange={(e) => setValue(e.target.value)}>
          {ORDER_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>內部備註</Label>
        <Textarea
          placeholder="僅運營可見"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      {saved ? <p className="text-sm text-emerald-700">已更新訂單狀態</p> : null}
      <Button type="button" disabled={pending} onClick={() => void save()}>
        {pending ? "儲存中…" : "更新狀態"}
      </Button>
    </div>
  );
}
