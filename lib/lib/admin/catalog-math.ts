import { Prisma } from "@prisma/client";

export function formatOmr(n: Prisma.Decimal | number): string {
  const d = typeof n === "number" ? new Prisma.Decimal(n) : n;
  return Number(d).toFixed(3);
}

/** Estimated unit profit and margin % (price − costs). */
export function unitProfitMeta(size: {
  priceOmr: Prisma.Decimal;
  ingredientCostOmr: Prisma.Decimal;
  packagingCostOmr: Prisma.Decimal;
  laborCostOmr: Prisma.Decimal;
}): { profitOmr: string; marginPct: string | null } {
  const price = new Prisma.Decimal(size.priceOmr);
  const costs = size.ingredientCostOmr.plus(size.packagingCostOmr).plus(size.laborCostOmr);
  const profit = price.minus(costs);
  if (price.equals(0)) {
    return { profitOmr: formatOmr(profit), marginPct: null };
  }
  const margin = profit.div(price).times(100);
  return {
    profitOmr: formatOmr(profit),
    marginPct: margin.toFixed(2),
  };
}
