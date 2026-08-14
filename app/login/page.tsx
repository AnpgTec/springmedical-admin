import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[var(--muted)]">載入中…</div>}>
      <LoginForm />
    </Suspense>
  );
}
