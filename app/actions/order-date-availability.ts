"use server";

import { z } from "zod";

import type { AvailabilityDayClientPayload } from "@/lib/availability/public-types";
import {
  getAvailabilityForDate,
  serializeAvailabilityDay,
} from "@/lib/availability/availability-service";

const schema = z.object({
  dateNeeded: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  quantity: z.coerce.number().int().min(1).max(999),
});

export async function getOrderDateAvailabilityAction(
  raw: unknown,
): Promise<
  | { ok: true; data: AvailabilityDayClientPayload }
  | { ok: false; error: "INVALID" }
> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "INVALID" };
  }
  const row = await getAvailabilityForDate(parsed.data.dateNeeded, parsed.data.quantity);
  return { ok: true, data: serializeAvailabilityDay(row) };
}
