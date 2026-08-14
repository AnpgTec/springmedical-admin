import { createClient } from "@/lib/supabase/server";
import { LeadAdminNote } from "@/components/LeadAdminNote";
import { LeadFilters } from "@/components/LeadFilters";
import { LeadStatusSelect } from "@/components/LeadStatusSelect";
import { formatDt } from "@/lib/utils";
import { isLeadSource, isLeadStatus, leadSourceLabel, localeLabel } from "@/lib/lead-meta";

function sanitizeSearch(raw: string) {
  return raw.replace(/[,()\\'"]/g, "").replace(/\s+/g, " ").trim();
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; source?: string; q?: string }>;
}) {
  const { status, source, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select(
      "id, name, email, phone, source, source_ref, product_or_treatment, remark, locale, status, admin_note, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && isLeadStatus(status)) {
    query = query.eq("status", status);
  }
  if (source && isLeadSource(source)) {
    query = query.eq("source", source);
  }

  const keyword = sanitizeSearch(q || "");
  if (keyword) {
    const pattern = `"%${keyword}%"`;
    query = query.or(
      `name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern},product_or_treatment.ilike.${pattern},source_ref.ilike.${pattern}`
    );
  }

  const { data } = await query;
  const rows = data || [];

  return (
    <div>
      <h1 className="text-4xl">預約 / 諮詢</h1>
      <LeadFilters />
      <p className="mt-3 text-sm text-[var(--muted)]">共 {rows.length} 筆</p>
      <div className="mt-3 overflow-x-auto rounded-xl border border-[var(--line)] bg-white">
        <table className="w-full min-w-[1200px] text-left text-sm">
          <thead className="bg-[var(--bg)] text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">姓名</th>
              <th className="px-4 py-3">聯絡</th>
              <th className="px-4 py-3">來源</th>
              <th className="px-4 py-3">意向</th>
              <th className="px-4 py-3">顧客備註</th>
              <th className="px-4 py-3">語言</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3">運營備註</th>
              <th className="px-4 py-3">提交時間</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-[var(--muted)]">
                  沒有符合條件的預約
                </td>
              </tr>
            ) : (
              rows.map((l) => (
                <tr key={l.id} className="border-t border-[var(--line)] align-top">
                  <td className="px-4 py-3">{l.name}</td>
                  <td className="px-4 py-3">
                    {l.phone || "—"}
                    <div className="text-xs text-[var(--muted)]">{l.email || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    {leadSourceLabel(l.source)}
                    {l.source_ref ? (
                      <div className="text-xs text-[var(--muted)]">{l.source_ref}</div>
                    ) : null}
                  </td>
                  <td className="max-w-[180px] px-4 py-3">{l.product_or_treatment || "—"}</td>
                  <td className="max-w-[220px] whitespace-pre-wrap px-4 py-3 text-[var(--muted)]">
                    {l.remark || "—"}
                  </td>
                  <td className="px-4 py-3">{localeLabel(l.locale)}</td>
                  <td className="px-4 py-3">
                    <LeadStatusSelect id={l.id} status={l.status} />
                  </td>
                  <td className="px-4 py-3">
                    <LeadAdminNote id={l.id} note={l.admin_note} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--muted)]">
                    {formatDt(l.created_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
