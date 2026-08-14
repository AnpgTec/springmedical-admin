import { requireStaff } from "@/lib/auth";
import { AdminShell } from "@/components/AdminShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile, email } = await requireStaff();
  return (
    <AdminShell profile={profile} email={email}>
      {children}
    </AdminShell>
  );
}
