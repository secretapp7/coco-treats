import "server-only";

import { getAdminBusinessSettings } from "@/lib/admin/data/settings-queries";
import { getDefaultBusinessSettingValues } from "@/lib/settings/defaults";
import type { PublicBusinessSettings } from "@/lib/settings/public-settings-types";

function defaultsToPublic(): PublicBusinessSettings {
  const d = getDefaultBusinessSettingValues();
  return {
    businessName: { en: d.business_name_en, ar: d.business_name_ar },
    businessCity: { en: d.business_city_en, ar: d.business_city_ar },
    currency: d.currency,
    whatsappNumber: d.whatsapp_number,
    instagramHandle: d.instagram_handle,
    instagramUrl: d.instagram_url,
    notes: {
      preorder: { en: d.preorder_note_en, ar: d.preorder_note_ar },
      delivery: { en: d.delivery_note_en, ar: d.delivery_note_ar },
      payment: { en: d.payment_note_en, ar: d.payment_note_ar },
      pickup: { en: d.pickup_note_en, ar: d.pickup_note_ar },
      largeOrder: { en: d.large_order_note_en, ar: d.large_order_note_ar },
    },
    home: {
      headline: { en: d.home_headline_en, ar: d.home_headline_ar },
      subtitle: { en: d.home_subtitle_en, ar: d.home_subtitle_ar },
    },
    contact: {
      intro: { en: d.contact_intro_en, ar: d.contact_intro_ar },
    },
  };
}

function adminRecordToPublic(row: Awaited<ReturnType<typeof getAdminBusinessSettings>>): PublicBusinessSettings {
  return {
    businessName: { en: row.businessNameEn, ar: row.businessNameAr },
    businessCity: { en: row.businessCityEn, ar: row.businessCityAr },
    currency: row.currency,
    whatsappNumber: row.whatsappNumber,
    instagramHandle: row.instagramHandle,
    instagramUrl: row.instagramUrl,
    notes: {
      preorder: { en: row.preorderNoteEn, ar: row.preorderNoteAr },
      delivery: { en: row.deliveryNoteEn, ar: row.deliveryNoteAr },
      payment: { en: row.paymentNoteEn, ar: row.paymentNoteAr },
      pickup: { en: row.pickupNoteEn, ar: row.pickupNoteAr },
      largeOrder: { en: row.largeOrderNoteEn, ar: row.largeOrderNoteAr },
    },
    home: {
      headline: { en: row.homeHeadlineEn, ar: row.homeHeadlineAr },
      subtitle: { en: row.homeSubtitleEn, ar: row.homeSubtitleAr },
    },
    contact: {
      intro: { en: row.contactIntroEn, ar: row.contactIntroAr },
    },
  };
}

/** Safe public loader — falls back to static config if DB is unavailable. */
export async function getPublicBusinessSettings(): Promise<PublicBusinessSettings> {
  try {
    const row = await getAdminBusinessSettings();
    return adminRecordToPublic(row);
  } catch {
    return defaultsToPublic();
  }
}

export type { PublicBusinessSettings };
