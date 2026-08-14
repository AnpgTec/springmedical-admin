"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Select } from "@/components/ui/input";

export function LeadStatusSelect({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);

  async function onChange(next: string) {
    setValue(next);
    const supabase = createClient();
    await supabase.from("leads").update({ status: next }).eq("id", id);
    router.refresh();
  }

  return (
    <Select value={value} onChange={(e) => void onChange(e.target.value)} className="h-8 w-36">
      <option value="new">新線索</option>
      <option value="in_progress">跟進中</option>
      <option value="closed">已關閉</option>
    </Select>
  );
}
