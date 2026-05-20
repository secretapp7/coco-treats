import { brand } from "@/config/brand";
import { translations } from "@/config/translations";

/** Static defaults when DB rows are missing (never contains secrets). */
export function getDefaultBusinessSettingValues(): Record<string, string> {
  const en = translations.en;
  const ar = translations.ar;

  return {
    business_name_en: brand.name.en,
    business_name_ar: brand.name.ar,
    business_city_en: brand.city.en,
    business_city_ar: brand.city.ar,
    currency: brand.currency,
    instagram_handle: brand.instagramHandle,
    instagram_url: brand.instagramUrl,
    whatsapp_number: brand.whatsappNumber,
    preorder_note_en: en.businessNotes.preorder24h,
    preorder_note_ar: ar.businessNotes.preorder24h,
    delivery_note_en: en.businessNotes.deliveryFeeWhatsApp,
    delivery_note_ar: ar.businessNotes.deliveryFeeWhatsApp,
    payment_note_en: en.businessNotes.paymentWhatsApp,
    payment_note_ar: ar.businessNotes.paymentWhatsApp,
    pickup_note_en: en.form.pickupDetailsWhatsappNote,
    pickup_note_ar: ar.form.pickupDetailsWhatsappNote,
    large_order_note_en:
      "Large orders require more preparation time. Please choose a later date.",
    large_order_note_ar: "الطلبات الكبيرة تحتاج وقت تحضير أطول. يرجى اختيار تاريخ لاحق.",
    home_headline_en: en.home.brandTagline,
    home_headline_ar: ar.home.brandTagline,
    home_subtitle_en: en.home.heroSubtitle,
    home_subtitle_ar: ar.home.heroSubtitle,
    contact_intro_en: en.contactPage.locationLine,
    contact_intro_ar: ar.contactPage.locationLine,
  };
}

export function parseLegacyBilingualJson(raw: string | undefined): { en: string; ar: string } | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as { en?: unknown; ar?: unknown };
    if (typeof parsed.en === "string" && typeof parsed.ar === "string") {
      return { en: parsed.en, ar: parsed.ar };
    }
  } catch {
    return null;
  }
  return null;
}
