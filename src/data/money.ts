import type { CostRange, Fact } from "@/lib/types";
import { fact } from "./sources";

const LAKH = 100_000;

/** Annual cost expressed in lakh-rupee bounds, always shown as a range. */
export function cost(minLakh: number, maxLakh: number, note?: string): Fact<CostRange> {
  return fact(
    { minINR: Math.round(minLakh * LAKH), maxINR: Math.round(maxLakh * LAKH), note },
    "src-seed",
    { confidence: "reported" },
  );
}

export function inLakh(value: number): string {
  if (value >= LAKH) {
    const v = value / LAKH;
    return `₹${v % 1 === 0 ? v.toFixed(0) : v.toFixed(1)} lakh`;
  }
  return `₹${(value / 1000).toFixed(0)}k`;
}

export function inINR(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

/** Approximate INR conversion used only for display on demo data. */
export const DEMO_FX: Record<string, { rate: number; symbol: string; asOf: string }> = {
  INR: { rate: 1, symbol: "₹", asOf: "2026-09-10" },
  USD: { rate: 88, symbol: "$", asOf: "2026-09-10" },
  EUR: { rate: 103, symbol: "€", asOf: "2026-09-10" },
  GBP: { rate: 116, symbol: "£", asOf: "2026-09-10" },
  CAD: { rate: 64, symbol: "C$", asOf: "2026-09-10" },
  AUD: { rate: 58, symbol: "A$", asOf: "2026-09-10" },
  SGD: { rate: 69, symbol: "S$", asOf: "2026-09-10" },
  NZD: { rate: 53, symbol: "NZ$", asOf: "2026-09-10" },
  CHF: { rate: 111, symbol: "CHF ", asOf: "2026-09-10" },
  JPY: { rate: 0.6, symbol: "¥", asOf: "2026-09-10" },
  KRW: { rate: 0.065, symbol: "₩", asOf: "2026-09-10" },
  AED: { rate: 24, symbol: "AED ", asOf: "2026-09-10" },
};

export function convertFromINR(inr: number, currency: string): string {
  const fx = DEMO_FX[currency];
  if (!fx || fx.rate === 0) return inINR(inr);
  const value = inr / fx.rate;
  const rounded = value >= 1000 ? Math.round(value / 100) * 100 : Math.round(value);
  return `${fx.symbol}${rounded.toLocaleString("en-US")}`;
}

export function convertToINR(amount: number, currency: string): number {
  const fx = DEMO_FX[currency];
  if (!fx) return amount;
  return Math.round(amount * fx.rate);
}
