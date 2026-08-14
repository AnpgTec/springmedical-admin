"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    search.get("error") === "not_staff" ? "此帳號不是啟用中的運營人員。" : ""
  );
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError("登入失敗，請檢查電郵與密碼。");
      setPending(false);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("登入失敗。");
      setPending(false);
      return;
    }
    const { data: profile } = await supabase
      .from("admin_profiles")
      .select("id, status")
      .eq("id", user.id)
      .eq("status", 1)
      .maybeSingle();
    if (!profile) {
      await supabase.auth.signOut();
      setError("此帳號不是啟用中的運營人員。請先在 Supabase 寫入 admin_profiles。");
      setPending(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-6">
      <div className="flex w-full max-w-sm flex-col items-center">
        <img
          src="/images/logo.png"
          alt="Spring Medical"
          className="mb-8 h-[72px] w-auto object-contain"
        />
        <form
          onSubmit={(e) => void onSubmit(e)}
          className="w-full rounded-2xl border border-[var(--line)] bg-white p-8 shadow-sm"
        >
          <h1 className="text-center text-3xl">運營後台</h1>
          <p className="mt-1 text-center text-sm text-[var(--muted)]">使用已授權的電郵與密碼登入</p>
        <div className="mt-6">
          <Label htmlFor="email">電郵</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div className="mt-4">
          <Label htmlFor="password">密碼</Label>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {error ? <p className="mt-3 text-sm text-[var(--danger)]">{error}</p> : null}
          <Button className="mt-6 w-full" type="submit" disabled={pending}>
            {pending ? "登入中…" : "登入"}
          </Button>
        </form>
      </div>
    </div>
  );
}
