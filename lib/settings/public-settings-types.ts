import { brand } from "@/config/brand";
import type { AppLanguage } from "@/config/translations";

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
