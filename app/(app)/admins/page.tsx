import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { AdminList } from "@/components/AdminList";

export default async function AdminsPage() {
  const { profile, userId } = await requireStaff();
  if (profile.role !== "admin") redirect("/");

  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_profiles")
    .select("id, display_name, role, status, created_at")
    .order("created_at", { ascending: false });

  const emailById = new Map<string, string>();
  try {
    const service = createServiceClient();
    const { data: listed } = await service.auth.admin.listUsers({ page: 1, perPage: 200 });
    for (const u of listed.users) {
      if (u.email) emailById.set(u.id, u.email);
    }
  } catch {
    /* service role optional for listing emails */
  }

  const rows = (data || []).map((row) => ({
    ...row,
    email: emailById.get(row.id),
  }));

  return (
    <div>
      <h1 className="text-4xl">管理員</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        在此直接建立登入帳號，對方用電郵與密碼進入本後台即可，無需打開 Supabase。僅超管可管理。
      </p>
      <div className="mt-6">
        <AdminList initial={rows} selfId={userId} />
      </div>
    </div>
  );
}
