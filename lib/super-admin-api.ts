import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function requireSuperAdminApi(): Promise<
  | { ok: true; actor: User; service: SupabaseClient }
  | { ok: false; response: NextResponse }
> {
  const session = await createClient();
  const {
    data: { user: actor },
  } = await session.auth.getUser();
  if (!actor) {
    return { ok: false, response: NextResponse.json({ error: "未登入。" }, { status: 401 }) };
  }

  const { data: actorProfile } = await session
    .from("admin_profiles")
    .select("role, status")
    .eq("id", actor.id)
    .maybeSingle();
  if (!actorProfile || actorProfile.role !== "admin" || actorProfile.status !== 1) {
    return { ok: false, response: NextResponse.json({ error: "僅超管可執行此操作。" }, { status: 403 }) };
  }

  try {
    const service = createServiceClient();
    return { ok: true, actor, service };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "伺服器未配置 SUPABASE_SERVICE_ROLE_KEY。" },
        { status: 500 }
      ),
    };
  }
}
