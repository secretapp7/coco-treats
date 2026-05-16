export type FulfillmentMethod = "pickup" | "delivery";

export const FULFILLMENT = {
  PICKUP: "pickup",
  DELIVERY: "delivery",
} as const satisfies Record<string, FulfillmentMethod>;
