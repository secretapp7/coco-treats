import { brand } from "@/config/brand";
import type { AppLanguage } from "@/config/translations";
import { getDefaultBusinessSettingValues } from "@/lib/settings/defaults";

export type PublicBusinessSettings = {
  businessName: { en: string; ar: string };
  businessCity: { en: string; ar: string };
  currency: string;
  whatsappNumber: string;
  instagramHandle: string;
  instagramUrl: string;
  notes: {
    preorder: { en: string; ar: string };
    delivery: { en: string; ar: string };
    payment: { en: string; ar: string };
    pickup: { en: string; ar: string };
    largeOrder: { en: string; ar: string };
  };
  home: {
    headline: { en: string; ar: string };
    subtitle: { en: string; ar: string };
  };
  contact: {
    intro: { en: string; ar: string };
  };
};

/** Static fallback for SSR/prerender when provider context is unavailable. */
export function getDefaultPublicBusinessSettings(): PublicBusinessSettings {
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

export function localizedFromSettings<T extends { en: string; ar: string }>(
  block: T,
  language: AppLanguage,
): string {
  return block[language];
}

export function resolveWhatsappNumber(settings?: PublicBusinessSettings | null): string {
  const raw = settings?.whatsappNumber?.trim() || brand.whatsappNumber;
  return raw.replace(/[\s-]/g, "");
}
