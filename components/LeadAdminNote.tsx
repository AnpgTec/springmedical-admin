"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LeadAdminNote({ id, note }: { id: string; note: string | null }) {
  const [value, setValue] = useState(note || "");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function persist() {
    const next = value.trim();
    if (next === (note || "").trim()) return;
    setPending(true);
    const supabase = createClient();
    await supabase.from("leads").update({ admin_note: next || null }).eq("id", id);
    setPending(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="min-w-[180px]">
      <textarea
        className="min-h-16 w-full rounded-lg border border-[var(--line)] bg-white px-2 py-1.5 text-sm outline-none focus:border-[var(--gold)]"
        placeholder="內部備註，失焦即儲存"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => void persist()}
      />
      <p className="mt-0.5 text-[11px] text-[var(--muted)]">
        {pending ? "儲存中…" : saved ? "已儲存" : " "}
      </p>
    </div>
  );
}
