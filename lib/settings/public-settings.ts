import "server-only";

import { getAdminBusinessSettings } from "@/lib/admin/data/settings-queries";
import {
  getDefaultPublicBusinessSettings,
  type PublicBusinessSettings,
} from "@/lib/settings/public-settings-types";

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
    return getDefaultPublicBusinessSettings();
  }
}

export type { PublicBusinessSettings };
