import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatHKD(amount: number | string) {
  return `HK$${Number(amount).toLocaleString("en-HK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("zh-HK", { hour12: false });
}
