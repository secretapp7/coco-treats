import { z } from "zod";

const NOTE_MAX = 600;
const SHORT_MAX = 120;

const noteField = z.string().trim().max(NOTE_MAX, `Must be ${NOTE_MAX} characters or fewer.`);

export function normalizeInstagramHandle(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "@";
  return trimmed.startsWith("@") ? trimmed : `@${trimmed.replace(/^@+/, "")}`;
}

export const businessIdentitySettingsSchema = z.object({
  businessNameEn: z.string().trim().min(1, "Business name (EN) is required.").max(SHORT_MAX),
  businessNameAr: z.string().trim().min(1, "Business name (AR) is required.").max(SHORT_MAX),
  businessCityEn: z.string().trim().min(1, "City (EN) is required.").max(SHORT_MAX),
  businessCityAr: z.string().trim().min(1, "City (AR) is required.").max(SHORT_MAX),
  currency: z
    .string()
    .trim()
    .min(2, "Currency is required.")
    .max(8)
    .transform((v) => v.toUpperCase()),
});

export const contactChannelSettingsSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .min(7, "WhatsApp number is required.")
    .max(20)
    .refine((v) => /^\+?[0-9]+$/.test(v.replace(/[\s-]/g, "")), {
      message: "WhatsApp number may only contain digits and an optional leading +.",
    })
    .transform((v) => v.replace(/[\s-]/g, "")),
  instagramHandle: z
    .string()
    .trim()
    .min(2, "Instagram handle is required.")
    .max(64)
    .transform(normalizeInstagramHandle),
  instagramUrl: z
    .string()
    .trim()
    .url("Enter a valid Instagram URL (https://…).")
    .max(200),
});

export const customerNoteSettingsSchema = z.object({
  preorderNoteEn: noteField.min(1, "Preorder note (EN) is required."),
  preorderNoteAr: noteField.min(1, "Preorder note (AR) is required."),
  deliveryNoteEn: noteField.min(1, "Delivery note (EN) is required."),
  deliveryNoteAr: noteField.min(1, "Delivery note (AR) is required."),
  paymentNoteEn: noteField.min(1, "Payment note (EN) is required."),
  paymentNoteAr: noteField.min(1, "Payment note (AR) is required."),
  pickupNoteEn: noteField.min(1, "Pickup note (EN) is required."),
  pickupNoteAr: noteField.min(1, "Pickup note (AR) is required."),
  largeOrderNoteEn: noteField.min(1, "Large order note (EN) is required."),
  largeOrderNoteAr: noteField.min(1, "Large order note (AR) is required."),
});

export const homepageCopySettingsSchema = z.object({
  homeHeadlineEn: noteField.min(1, "Home headline (EN) is required."),
  homeHeadlineAr: noteField.min(1, "Home headline (AR) is required."),
  homeSubtitleEn: noteField.min(1, "Home subtitle (EN) is required."),
  homeSubtitleAr: noteField.min(1, "Home subtitle (AR) is required."),
});

export const contactCopySettingsSchema = z.object({
  contactIntroEn: noteField.min(1, "Contact intro (EN) is required."),
  contactIntroAr: noteField.min(1, "Contact intro (AR) is required."),
});
