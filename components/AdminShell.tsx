"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  Users,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { StaffProfile } from "@/lib/auth";

const nav = [
  { href: "/", label: "總覽", icon: LayoutDashboard },
  { href: "/brands", label: "品牌", icon: Tag },
  { href: "/products", label: "商品", icon: Package },
  { href: "/orders", label: "訂單", icon: ShoppingBag },
  { href: "/payments", label: "支付", icon: CreditCard },
  { href: "/leads", label: "預約", icon: MessageSquare },
  { href: "/admins", label: "管理員", icon: Users, adminOnly: true },
];

export function AdminShell({
  profile,
  email,
  children,
}: {
  profile: StaffProfile;
  email?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col bg-[var(--sidebar)] text-white">
        <div className="border-b border-white/10 px-5 py-6">
          <div className="text-xs tracking-[0.2em] text-[var(--gold)]">SPRING MEDICAL</div>
          <div className="mt-1 font-serif text-xl">Admin</div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav
            .filter((i) => !i.adminOnly || profile.role === "admin")
            .map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                    active ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
        </nav>
        <div className="border-t border-white/10 p-4 text-xs text-white/60">
          <div className="truncate">{profile.display_name}</div>
          <div className="truncate">{email}</div>
          <div className="mt-1 text-[var(--gold)]">{profile.role === "admin" ? "超管" : "運營"}</div>
          <button
            type="button"
            onClick={() => void logout()}
            className="mt-3 flex items-center gap-2 text-white/70 hover:text-white"
          >
            <LogOut size={14} />
            退出
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}
