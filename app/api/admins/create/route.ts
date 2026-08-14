import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/super-admin-api";

type Body = {
  email?: string;
  password?: string;
  display_name?: string;
  role?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const display_name = (body.display_name || "").trim();
  const role = body.role === "admin" ? "admin" : "operator";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "請填寫有效電郵。" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "密碼至少 8 位。" }, { status: 400 });
  }
  if (!display_name) {
    return NextResponse.json({ error: "請填寫顯示名。" }, { status: 400 });
  }

  const gate = await requireSuperAdminApi();
  if (!gate.ok) return gate.response;
  const service = gate.service;

  let userId: string | undefined;
  const created = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (created.data.user) {
    userId = created.data.user.id;
  } else {
    const msg = created.error?.message || "";
    const duplicate =
      created.error?.status === 422 ||
      /already been registered|already exists|duplicate/i.test(msg);
    if (!duplicate) {
      return NextResponse.json({ error: msg || "建立登入帳號失敗。" }, { status: 400 });
    }
    const { data: listed } = await service.auth.admin.listUsers({ page: 1, perPage: 200 });
    userId = listed.users.find((u) => (u.email || "").toLowerCase() === email)?.id;
    if (!userId) {
      return NextResponse.json({ error: "此電郵已存在，但無法讀取用戶。" }, { status: 400 });
    }
  }

  const { data: existing } = await service
    .from("admin_profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "此電郵已是管理員。" }, { status: 400 });
  }

  const { data: profile, error: pErr } = await service
    .from("admin_profiles")
    .insert({
      id: userId,
      display_name,
      role,
      status: 1,
    })
    .select("id, display_name, role, status, created_at")
    .single();

  if (pErr || !profile) {
    return NextResponse.json({ error: pErr?.message || "寫入管理員資料失敗。" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    profile: { ...profile, email },
  });
}
