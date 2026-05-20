import "server-only";

import {
  DeliveryStatus,
  FulfillmentMethod,
  OrderStatus,
  PaymentStatus,
  type Prisma,
} from "@prisma/client";

import { decimalToFormString, dateToUtcYmd } from "@/lib/admin/admin-serialize";
import {
  addUtcCalendarDays,
  utcIsoToday,
  utcMidnightFromIsoDay,
} from "@/lib/availability/availability-service";
import { prisma } from "@/lib/db/prisma";

const PRODUCTION_STATUSES: OrderStatus[] = [
  OrderStatus.NEW,
  OrderStatus.CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.READY,
  OrderStatus.DELIVERED,
];

export type ProductionStatusCounts = {
  NEW: number;
  CONFIRMED: number;
  PREPARING: number;
  READY: number;
  DELIVERED: number;
};

export type ProductionPlanSummary = {
  totalOrders: number;
  totalUnits: number;
  pickupOrders: number;
  deliveryOrders: number;
  estimatedRevenueOmr: string;
  estimatedProfitOmr: string | null;
  hasProfitData: boolean;
  statusCounts: ProductionStatusCounts;
};

export type ProductionProductGroup = {
  key: string;
  productNameEn: string;
  productNameAr: string;
  sizeLabelEn: string;
  sizeLabelAr: string;
  quantity: number;
  orderCount: number;
  revenueSubtotalOmr: string;
  profitSubtotalOmr: string | null;
};

export type ProductionOrderRow = {
  id: string;
  publicId: string;
  customerName: string;
  customerPhone: string;
  fulfillmentMethod: FulfillmentMethod;
  orderStatus: OrderStatus;
  deliveryStatus: DeliveryStatus;
  paymentStatus: PaymentStatus;
  totalOmr: string;
  dateNeededIso: string;
  isArchived: boolean;
  isDelivered: boolean;
  isUnpaid: boolean;
  deliveryWarning: boolean;
  addressSummary: string | null;
};

export type ProductionChecklistLine = {
  label: string;
  quantity: number;
};

export type ProductionDeliveryChecklistLine = {
  publicId: string;
  customerName: string;
  warning: boolean;
  addressSummary: string | null;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
};

export type ProductionPlan = {
  dateIso: string;
  summary: ProductionPlanSummary;
  productGroups: ProductionProductGroup[];
  orders: ProductionOrderRow[];
  pickupOrders: ProductionOrderRow[];
  deliveryOrders: ProductionOrderRow[];
  checklists: {
    ingredients: ProductionChecklistLine[];
    packaging: ProductionChecklistLine[];
    delivery: {
      orderCount: number;
      lines: ProductionDeliveryChecklistLine[];
    };
  };
};

export type ProductionDayBrief = {
  dateIso: string;
  totalOrders: number;
  totalUnits: number;
};

export type ProductionDashboardSummary = {
  tomorrowIso: string;
  tomorrowOrders: number;
  tomorrowUnits: number;
  topItemTomorrow: { label: string; quantity: number } | null;
};

const orderSelect = {
  id: true,
  publicId: true,
  customerName: true,
  customerPhone: true,
  fulfillmentMethod: true,
  orderStatus: true,
  deliveryStatus: true,
  paymentStatus: true,
  dateNeeded: true,
  totalOmr: true,
  archivedAt: true,
  mapsLink: true,
  addressDetails: true,
  gpsLatitude: true,
  items: {
    select: {
      productNameEn: true,
      productNameAr: true,
      sizeLabelEn: true,
      sizeLabelAr: true,
      quantity: true,
      lineTotalOmr: true,
      estimatedLineProfitOmr: true,
      estimatedUnitCostOmr: true,
    },
  },
} satisfies Prisma.OrderSelect;

type RawProductionOrder = Prisma.OrderGetPayload<{ select: typeof orderSelect }>;

function utcDateRangeFromIso(isoDay: string): { start: Date; end: Date } {
  const start = utcMidnightFromIsoDay(isoDay);
  const end = new Date(start.getTime() + 86_400_000 - 1);
  return { start, end };
}

export function parseProductionDateIso(input: string | undefined | null): string | null {
  if (!input?.trim()) return null;
  const m = input.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = utcMidnightFromIsoDay(m[0]);
  if (Number.isNaN(d.getTime())) return null;
  return m[0];
}

function productGroupKey(nameEn: string, sizeEn: string) {
  return `${nameEn}::${sizeEn}`;
}

function emptyStatusCounts(): ProductionStatusCounts {
  return { NEW: 0, CONFIRMED: 0, PREPARING: 0, READY: 0, DELIVERED: 0 };
}

function deliveryAddressSummary(order: RawProductionOrder): string | null {
  const parts: string[] = [];
  if (order.addressDetails?.trim()) parts.push(order.addressDetails.trim());
  if (order.mapsLink?.trim()) parts.push("Maps link on file");
  if (order.gpsLatitude != null) parts.push("GPS coordinates on file");
  return parts.length > 0 ? parts.join(" · ") : null;
}

function hasDeliveryLocationWarning(order: RawProductionOrder): boolean {
  if (order.fulfillmentMethod !== FulfillmentMethod.DELIVERY) return false;
  const hasAddress = Boolean(order.addressDetails?.trim());
  const hasMaps = Boolean(order.mapsLink?.trim());
  const hasGps = order.gpsLatitude != null;
  return !hasAddress && !hasMaps && !hasGps;
}

function serializeOrderRow(order: RawProductionOrder): ProductionOrderRow {
  return {
    id: order.id,
    publicId: order.publicId,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    fulfillmentMethod: order.fulfillmentMethod,
    orderStatus: order.orderStatus,
    deliveryStatus: order.deliveryStatus,
    paymentStatus: order.paymentStatus,
    totalOmr: decimalToFormString(order.totalOmr),
    dateNeededIso: dateToUtcYmd(order.dateNeeded),
    isArchived: order.archivedAt != null,
    isDelivered: order.orderStatus === OrderStatus.DELIVERED,
    isUnpaid: order.paymentStatus === PaymentStatus.UNPAID,
    deliveryWarning: hasDeliveryLocationWarning(order),
    addressSummary: deliveryAddressSummary(order),
  };
}

function buildProductionPlan(dateIso: string, orders: RawProductionOrder[]): ProductionPlan {
  const statusCounts = emptyStatusCounts();
  let totalUnits = 0;
  let pickupOrders = 0;
  let deliveryOrders = 0;
  let revenueSum = 0;
  let profitSum = 0;
  let profitLines = 0;

  const groupMap = new Map<
    string,
    {
      productNameEn: string;
      productNameAr: string;
      sizeLabelEn: string;
      sizeLabelAr: string;
      quantity: number;
      orderIds: Set<string>;
      revenue: number;
      profit: number;
      profitLines: number;
    }
  >();

  for (const order of orders) {
    if (PRODUCTION_STATUSES.includes(order.orderStatus)) {
      statusCounts[order.orderStatus as keyof ProductionStatusCounts] += 1;
    }
    if (order.fulfillmentMethod === FulfillmentMethod.PICKUP) pickupOrders += 1;
    if (order.fulfillmentMethod === FulfillmentMethod.DELIVERY) deliveryOrders += 1;
    revenueSum += Number(order.totalOmr);

    for (const item of order.items) {
      totalUnits += item.quantity;
      const key = productGroupKey(item.productNameEn, item.sizeLabelEn);
      const existing = groupMap.get(key) ?? {
        productNameEn: item.productNameEn,
        productNameAr: item.productNameAr,
        sizeLabelEn: item.sizeLabelEn,
        sizeLabelAr: item.sizeLabelAr,
        quantity: 0,
        orderIds: new Set<string>(),
        revenue: 0,
        profit: 0,
        profitLines: 0,
      };
      existing.quantity += item.quantity;
      existing.orderIds.add(order.id);
      existing.revenue += Number(item.lineTotalOmr);
      const lineProfit = Number(item.estimatedLineProfitOmr);
      const unitCost = Number(item.estimatedUnitCostOmr);
      if (Number.isFinite(lineProfit)) {
        existing.profit += lineProfit;
        existing.profitLines += 1;
        profitSum += lineProfit;
        profitLines += 1;
      } else if (unitCost > 0) {
        existing.profitLines += 1;
      }
      groupMap.set(key, existing);
    }
  }

  const productGroups: ProductionProductGroup[] = [...groupMap.entries()]
    .map(([key, g]) => ({
      key,
      productNameEn: g.productNameEn,
      productNameAr: g.productNameAr,
      sizeLabelEn: g.sizeLabelEn,
      sizeLabelAr: g.sizeLabelAr,
      quantity: g.quantity,
      orderCount: g.orderIds.size,
      revenueSubtotalOmr: decimalToFormString(g.revenue),
      profitSubtotalOmr: g.profitLines > 0 ? decimalToFormString(g.profit) : null,
    }))
    .sort((a, b) => b.quantity - a.quantity || a.productNameEn.localeCompare(b.productNameEn));

  const serializedOrders = orders.map(serializeOrderRow);
  const pickupList = serializedOrders.filter((o) => o.fulfillmentMethod === FulfillmentMethod.PICKUP);
  const deliveryList = serializedOrders.filter((o) => o.fulfillmentMethod === FulfillmentMethod.DELIVERY);

  const checklistLines: ProductionChecklistLine[] = productGroups.map((g) => ({
    label: `${g.productNameEn} — ${g.sizeLabelEn}`,
    quantity: g.quantity,
  }));

  return {
    dateIso,
    summary: {
      totalOrders: orders.length,
      totalUnits,
      pickupOrders,
      deliveryOrders,
      estimatedRevenueOmr: decimalToFormString(revenueSum),
      estimatedProfitOmr: profitLines > 0 ? decimalToFormString(profitSum) : null,
      hasProfitData: profitLines > 0,
      statusCounts,
    },
    productGroups,
    orders: serializedOrders,
    pickupOrders: pickupList,
    deliveryOrders: deliveryList,
    checklists: {
      ingredients: checklistLines,
      packaging: checklistLines.map((line) => ({ ...line })),
      delivery: {
        orderCount: deliveryList.length,
        lines: deliveryList.map((o) => ({
          publicId: o.publicId,
          customerName: o.customerName,
          warning: o.deliveryWarning,
          addressSummary: o.addressSummary,
          paymentStatus: o.paymentStatus,
          deliveryStatus: o.deliveryStatus,
        })),
      },
    },
  };
}

async function fetchProductionOrdersForRange(startIso: string, endIso: string) {
  const { start } = utcDateRangeFromIso(startIso);
  const { end } = utcDateRangeFromIso(endIso);

  return prisma.order.findMany({
    where: {
      dateNeeded: { gte: start, lte: end },
      orderStatus: { not: OrderStatus.CANCELLED },
    },
    orderBy: [{ dateNeeded: "asc" }, { createdAt: "asc" }],
    select: orderSelect,
  });
}

export async function getProductionPlanForDate(date: string | Date): Promise<ProductionPlan> {
  const dateIso =
    typeof date === "string" ? (parseProductionDateIso(date) ?? dateToUtcYmd(date)) : dateToUtcYmd(date);
  const { start, end } = utcDateRangeFromIso(dateIso);

  const orders = await prisma.order.findMany({
    where: {
      dateNeeded: { gte: start, lte: end },
      orderStatus: { not: OrderStatus.CANCELLED },
    },
    orderBy: [{ fulfillmentMethod: "asc" }, { orderStatus: "asc" }, { createdAt: "asc" }],
    select: orderSelect,
  });

  return buildProductionPlan(dateIso, orders);
}

export async function getProductionPlanRange(
  startDate: string | Date,
  endDate: string | Date,
): Promise<ProductionPlan[]> {
  const startIso =
    typeof startDate === "string"
      ? (parseProductionDateIso(startDate) ?? dateToUtcYmd(startDate))
      : dateToUtcYmd(startDate);
  const endIso =
    typeof endDate === "string"
      ? (parseProductionDateIso(endDate) ?? dateToUtcYmd(endDate))
      : dateToUtcYmd(endDate);

  const orders = await fetchProductionOrdersForRange(startIso, endIso);
  const byDay = new Map<string, RawProductionOrder[]>();

  for (const order of orders) {
    const day = dateToUtcYmd(order.dateNeeded);
    const list = byDay.get(day) ?? [];
    list.push(order);
    byDay.set(day, list);
  }

  const plans: ProductionPlan[] = [];
  let cursor = startIso;
  while (cursor <= endIso) {
    plans.push(buildProductionPlan(cursor, byDay.get(cursor) ?? []));
    cursor = addUtcCalendarDays(cursor, 1);
  }

  return plans;
}

export async function getTomorrowProductionSummary(): Promise<ProductionDashboardSummary> {
  const tomorrowIso = addUtcCalendarDays(utcIsoToday(), 1);
  const plan = await getProductionPlanForDate(tomorrowIso);
  const top = plan.productGroups[0];

  return {
    tomorrowIso,
    tomorrowOrders: plan.summary.totalOrders,
    tomorrowUnits: plan.summary.totalUnits,
    topItemTomorrow: top
      ? { label: `${top.productNameEn} — ${top.sizeLabelEn}`, quantity: top.quantity }
      : null,
  };
}

export async function getProductionDashboardSummary(): Promise<ProductionDashboardSummary> {
  return getTomorrowProductionSummary();
}

export function getProductionWeekDayIsos(startIso?: string, days = 7): string[] {
  const base = startIso ?? utcIsoToday();
  return Array.from({ length: days }, (_, i) => addUtcCalendarDays(base, i));
}
