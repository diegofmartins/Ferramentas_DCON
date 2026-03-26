import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function parseCurrency(text: string): number {
  if (typeof text === "number") return text;
  if (typeof text !== "string") return 0;
  return parseFloat(text.replace(/[R$\.]/g, "").replace(",", ".")) || 0;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "N/A";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
  } catch {
    return "N/A";
  }
}
