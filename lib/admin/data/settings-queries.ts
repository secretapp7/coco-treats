import "server-only";

import { prisma } from "@/lib/db/prisma";
import {
  getDefaultBusinessSettingValues,
  parseLegacyBilingualJson,
} from "@/lib/settings/defaults";
import {
  ALL_BUSINESS_SETTING_KEYS,
  BUSINESS_SETTING_KEYS,
  LEGACY_NOTE_KEYS,
  type BusinessSettingKey,
} from "@/lib/settings/settings-keys";

export type AdminBusinessSettingsRecord = {
  businessNameEn: string;
  businessNameAr: string;
  businessCityEn: string;
  businessCityAr: string;
  currency: string;
  whatsappNumber: string;
  instagramHandle: string;
  instagramUrl: string;
  preorderNoteEn: string;
  preorderNoteAr: string;
  deliveryNoteEn: string;
  deliveryNoteAr: string;
  paymentNoteEn: string;
  paymentNoteAr: string;
  pickupNoteEn: string;
  pickupNoteAr: string;
  largeOrderNoteEn: string;
  largeOrderNoteAr: string;
  homeHeadlineEn: string;
  homeHeadlineAr: string;
  homeSubtitleEn: string;
  homeSubtitleAr: string;
  contactIntroEn: string;
  contactIntroAr: string;
};

async function loadSettingsMap(): Promise<Map<string, string>> {
  const rows = await prisma.businessSetting.findMany({
    select: { key: true, value: true },
  });
  return new Map(rows.map((r) => [r.key, r.value]));
}

function pick(map: Map<string, string>, key: BusinessSettingKey, defaults: Record<string, string>): string {
  const fromDb = map.get(key)?.trim();
  if (fromDb) return fromDb;
  return defaults[key] ?? "";
}

function pickBilingualNote(
  map: Map<string, string>,
  enKey: BusinessSettingKey,
  arKey: BusinessSettingKey,
  legacyKey: string,
  defaults: Record<string, string>,
): { en: string; ar: string } {
  const en = pick(map, enKey, defaults);
  const ar = pick(map, arKey, defaults);
  if (map.has(enKey) || map.has(arKey)) {
    return { en, ar };
  }
  const legacy = parseLegacyBilingualJson(map.get(legacyKey));
  if (legacy) return legacy;
  return {
    en: defaults[enKey] ?? en,
    ar: defaults[arKey] ?? ar,
  };
}

export async function getAdminBusinessSettings(): Promise<AdminBusinessSettingsRecord> {
  const map = await loadSettingsMap();
  const defaults = getDefaultBusinessSettingValues();

  const preorder = pickBilingualNote(
    map,
    BUSINESS_SETTING_KEYS.preorderNoteEn,
    BUSINESS_SETTING_KEYS.preorderNoteAr,
    LEGACY_NOTE_KEYS.preorder,
    defaults,
  );
  const delivery = pickBilingualNote(
    map,
    BUSINESS_SETTING_KEYS.deliveryNoteEn,
    BUSINESS_SETTING_KEYS.deliveryNoteAr,
    LEGACY_NOTE_KEYS.deliveryFee,
    defaults,
  );
  const payment = pickBilingualNote(
    map,
    BUSINESS_SETTING_KEYS.paymentNoteEn,
    BUSINESS_SETTING_KEYS.paymentNoteAr,
    LEGACY_NOTE_KEYS.payment,
    defaults,
  );

  return {
    businessNameEn: pick(map, BUSINESS_SETTING_KEYS.businessNameEn, defaults),
    businessNameAr: pick(map, BUSINESS_SETTING_KEYS.businessNameAr, defaults),
    businessCityEn: pick(map, BUSINESS_SETTING_KEYS.businessCityEn, defaults),
    businessCityAr: pick(map, BUSINESS_SETTING_KEYS.businessCityAr, defaults),
    currency: pick(map, BUSINESS_SETTING_KEYS.currency, defaults),
    whatsappNumber: pick(map, BUSINESS_SETTING_KEYS.whatsappNumber, defaults),
    instagramHandle: pick(map, BUSINESS_SETTING_KEYS.instagramHandle, defaults),
    instagramUrl: pick(map, BUSINESS_SETTING_KEYS.instagramUrl, defaults),
    preorderNoteEn: preorder.en,
    preorderNoteAr: preorder.ar,
    deliveryNoteEn: delivery.en,
    deliveryNoteAr: delivery.ar,
    paymentNoteEn: payment.en,
    paymentNoteAr: payment.ar,
    pickupNoteEn: pick(map, BUSINESS_SETTING_KEYS.pickupNoteEn, defaults),
    pickupNoteAr: pick(map, BUSINESS_SETTING_KEYS.pickupNoteAr, defaults),
    largeOrderNoteEn: pick(map, BUSINESS_SETTING_KEYS.largeOrderNoteEn, defaults),
    largeOrderNoteAr: pick(map, BUSINESS_SETTING_KEYS.largeOrderNoteAr, defaults),
    homeHeadlineEn: pick(map, BUSINESS_SETTING_KEYS.homeHeadlineEn, defaults),
    homeHeadlineAr: pick(map, BUSINESS_SETTING_KEYS.homeHeadlineAr, defaults),
    homeSubtitleEn: pick(map, BUSINESS_SETTING_KEYS.homeSubtitleEn, defaults),
    homeSubtitleAr: pick(map, BUSINESS_SETTING_KEYS.homeSubtitleAr, defaults),
    contactIntroEn: pick(map, BUSINESS_SETTING_KEYS.contactIntroEn, defaults),
    contactIntroAr: pick(map, BUSINESS_SETTING_KEYS.contactIntroAr, defaults),
  };
}

export async function upsertBusinessSettings(entries: Array<{ key: string; value: string }>) {
  for (const { key, value } of entries) {
    await prisma.businessSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
}

export function getSeedBusinessSettingEntries(): Array<{ key: string; value: string }> {
  return ALL_BUSINESS_SETTING_KEYS.map((key) => ({
    key,
    value: getDefaultBusinessSettingValues()[key] ?? "",
  }));
}
