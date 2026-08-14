import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/super-admin-api";

type Body = {
  id?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const id = (body.id || "").trim();
  const password = body.password || "";
  if (!id) {
    return NextResponse.json({ error: "缺少帳號。" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "密碼至少 8 位。" }, { status: 400 });
  }

  const gate = await requireSuperAdminApi();
  if (!gate.ok) return gate.response;

  const { data: profile } = await gate.service
    .from("admin_profiles")
    .select("id, display_name")
    .eq("id", id)
    .maybeSingle();
  if (!profile) {
    return NextResponse.json({ error: "找不到該管理員。" }, { status: 404 });
  }

  const { error } = await gate.service.auth.admin.updateUserById(id, { password });
  if (error) {
    return NextResponse.json({ error: error.message || "重置密碼失敗。" }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id });
}
