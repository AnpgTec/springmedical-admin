export const LEAD_STATUS_OPTIONS = [
  { value: "new", label: "新線索" },
  { value: "in_progress", label: "跟進中" },
  { value: "closed", label: "已關閉" },
] as const;

export const LEAD_SOURCE_OPTIONS = [
  { value: "treatment", label: "療程" },
  { value: "contact", label: "聯繫我們" },
  { value: "shop", label: "商城" },
  { value: "other", label: "其他" },
] as const;

const STATUS_SET = new Set<string>(LEAD_STATUS_OPTIONS.map((s) => s.value));
const SOURCE_SET = new Set<string>(LEAD_SOURCE_OPTIONS.map((s) => s.value));

export function isLeadStatus(value: string) {
  return STATUS_SET.has(value);
}

export function isLeadSource(value: string) {
  return SOURCE_SET.has(value);
}

export function leadStatusLabel(value: string) {
  return LEAD_STATUS_OPTIONS.find((s) => s.value === value)?.label || value;
}

export function leadSourceLabel(value: string) {
  return LEAD_SOURCE_OPTIONS.find((s) => s.value === value)?.label || value;
}

export function localeLabel(value: string | null | undefined) {
  if (value === "zh-CN") return "简中";
  if (value === "en") return "English";
  if (value === "zh-HK") return "繁中";
  return value || "—";
}
