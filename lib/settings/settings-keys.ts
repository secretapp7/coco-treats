/** BusinessSetting.key values for admin + public copy (non-secret). */
export const BUSINESS_SETTING_KEYS = {
  businessNameEn: "business_name_en",
  businessNameAr: "business_name_ar",
  businessCityEn: "business_city_en",
  businessCityAr: "business_city_ar",
  currency: "currency",
  instagramHandle: "instagram_handle",
  instagramUrl: "instagram_url",
  whatsappNumber: "whatsapp_number",
  preorderNoteEn: "preorder_note_en",
  preorderNoteAr: "preorder_note_ar",
  deliveryNoteEn: "delivery_note_en",
  deliveryNoteAr: "delivery_note_ar",
  paymentNoteEn: "payment_note_en",
  paymentNoteAr: "payment_note_ar",
  pickupNoteEn: "pickup_note_en",
  pickupNoteAr: "pickup_note_ar",
  largeOrderNoteEn: "large_order_note_en",
  largeOrderNoteAr: "large_order_note_ar",
  homeHeadlineEn: "home_headline_en",
  homeHeadlineAr: "home_headline_ar",
  homeSubtitleEn: "home_subtitle_en",
  homeSubtitleAr: "home_subtitle_ar",
  contactIntroEn: "contact_intro_en",
  contactIntroAr: "contact_intro_ar",
} as const;

export type BusinessSettingKey = (typeof BUSINESS_SETTING_KEYS)[keyof typeof BUSINESS_SETTING_KEYS];

/** Legacy JSON note keys (seed v1) — read for fallback only. */
export const LEGACY_NOTE_KEYS = {
  preorder: "note_preorder",
  deliveryFee: "note_delivery_fee",
  payment: "note_payment",
} as const;

export const ALL_BUSINESS_SETTING_KEYS: BusinessSettingKey[] = Object.values(BUSINESS_SETTING_KEYS);
