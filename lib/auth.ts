import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type StaffProfile = {
  id: string;
  display_name: string;
  role: "admin" | "operator";
  status: number;
};

export async function requireStaff(): Promise<{
  userId: string;
  email: string | undefined;
  profile: StaffProfile;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("id, display_name, role, status")
    .eq("id", user.id)
    .eq("status", 1)
    .maybeSingle();

  if (!profile) {
    await supabase.auth.signOut();
    redirect("/login?error=not_staff");
  }

  return {
    userId: user.id,
    email: user.email,
    profile: profile as StaffProfile,
  };
}
