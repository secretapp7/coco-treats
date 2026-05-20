"use server";

import { revalidatePath } from "next/cache";

import type { AdminFormState } from "@/lib/admin/admin-form-state";
import { upsertBusinessSettings } from "@/lib/admin/data/settings-queries";
import {
  businessIdentitySettingsSchema,
  contactChannelSettingsSchema,
  contactCopySettingsSchema,
  customerNoteSettingsSchema,
  homepageCopySettingsSchema,
} from "@/lib/admin/validation/settings-admin";
import { requireAdmin } from "@/lib/auth/admin-session";
import { revalidateStorefrontPaths } from "@/lib/storefront/revalidate-storefront";
import { BUSINESS_SETTING_KEYS } from "@/lib/settings/settings-keys";

function friendlyErr(): string {
  return "Something went wrong. Please try again.";
}

function revalidateSettingsPaths() {
  revalidatePath("/admin/settings");
  revalidateStorefrontPaths();
  revalidatePath("/contact");
}

function formString(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "");
}

function zodErrorMessage(parsed: { success: false; error: { issues: { message: string }[] } }): string {
  return parsed.error.issues.map((i) => i.message).join(" ");
}

export async function updateBusinessIdentitySettingsAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = businessIdentitySettingsSchema.safeParse({
    businessNameEn: formString(formData, "businessNameEn"),
    businessNameAr: formString(formData, "businessNameAr"),
    businessCityEn: formString(formData, "businessCityEn"),
    businessCityAr: formString(formData, "businessCityAr"),
    currency: formString(formData, "currency"),
  });
  if (!parsed.success) return { error: zodErrorMessage(parsed) };

  try {
    const d = parsed.data;
    await upsertBusinessSettings([
      { key: BUSINESS_SETTING_KEYS.businessNameEn, value: d.businessNameEn },
      { key: BUSINESS_SETTING_KEYS.businessNameAr, value: d.businessNameAr },
      { key: BUSINESS_SETTING_KEYS.businessCityEn, value: d.businessCityEn },
      { key: BUSINESS_SETTING_KEYS.businessCityAr, value: d.businessCityAr },
      { key: BUSINESS_SETTING_KEYS.currency, value: d.currency },
    ]);
  } catch {
    return { error: friendlyErr() };
  }

  revalidateSettingsPaths();
  return { success: "Business identity saved." };
}

export async function updateContactSettingsAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = contactChannelSettingsSchema.safeParse({
    whatsappNumber: formString(formData, "whatsappNumber"),
    instagramHandle: formString(formData, "instagramHandle"),
    instagramUrl: formString(formData, "instagramUrl"),
  });
  if (!parsed.success) return { error: zodErrorMessage(parsed) };

  try {
    const d = parsed.data;
    await upsertBusinessSettings([
      { key: BUSINESS_SETTING_KEYS.whatsappNumber, value: d.whatsappNumber },
      { key: BUSINESS_SETTING_KEYS.instagramHandle, value: d.instagramHandle },
      { key: BUSINESS_SETTING_KEYS.instagramUrl, value: d.instagramUrl },
    ]);
  } catch {
    return { error: friendlyErr() };
  }

  revalidateSettingsPaths();
  return { success: "Contact channels saved." };
}

export async function updateCustomerNoteSettingsAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = customerNoteSettingsSchema.safeParse({
    preorderNoteEn: formString(formData, "preorderNoteEn"),
    preorderNoteAr: formString(formData, "preorderNoteAr"),
    deliveryNoteEn: formString(formData, "deliveryNoteEn"),
    deliveryNoteAr: formString(formData, "deliveryNoteAr"),
    paymentNoteEn: formString(formData, "paymentNoteEn"),
    paymentNoteAr: formString(formData, "paymentNoteAr"),
    pickupNoteEn: formString(formData, "pickupNoteEn"),
    pickupNoteAr: formString(formData, "pickupNoteAr"),
    largeOrderNoteEn: formString(formData, "largeOrderNoteEn"),
    largeOrderNoteAr: formString(formData, "largeOrderNoteAr"),
  });
  if (!parsed.success) return { error: zodErrorMessage(parsed) };

  try {
    const d = parsed.data;
    await upsertBusinessSettings([
      { key: BUSINESS_SETTING_KEYS.preorderNoteEn, value: d.preorderNoteEn },
      { key: BUSINESS_SETTING_KEYS.preorderNoteAr, value: d.preorderNoteAr },
      { key: BUSINESS_SETTING_KEYS.deliveryNoteEn, value: d.deliveryNoteEn },
      { key: BUSINESS_SETTING_KEYS.deliveryNoteAr, value: d.deliveryNoteAr },
      { key: BUSINESS_SETTING_KEYS.paymentNoteEn, value: d.paymentNoteEn },
      { key: BUSINESS_SETTING_KEYS.paymentNoteAr, value: d.paymentNoteAr },
      { key: BUSINESS_SETTING_KEYS.pickupNoteEn, value: d.pickupNoteEn },
      { key: BUSINESS_SETTING_KEYS.pickupNoteAr, value: d.pickupNoteAr },
      { key: BUSINESS_SETTING_KEYS.largeOrderNoteEn, value: d.largeOrderNoteEn },
      { key: BUSINESS_SETTING_KEYS.largeOrderNoteAr, value: d.largeOrderNoteAr },
    ]);
  } catch {
    return { error: friendlyErr() };
  }

  revalidateSettingsPaths();
  return { success: "Customer notes saved." };
}

export async function updateHomepageSettingsAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = homepageCopySettingsSchema.safeParse({
    homeHeadlineEn: formString(formData, "homeHeadlineEn"),
    homeHeadlineAr: formString(formData, "homeHeadlineAr"),
    homeSubtitleEn: formString(formData, "homeSubtitleEn"),
    homeSubtitleAr: formString(formData, "homeSubtitleAr"),
  });
  if (!parsed.success) return { error: zodErrorMessage(parsed) };

  try {
    const d = parsed.data;
    await upsertBusinessSettings([
      { key: BUSINESS_SETTING_KEYS.homeHeadlineEn, value: d.homeHeadlineEn },
      { key: BUSINESS_SETTING_KEYS.homeHeadlineAr, value: d.homeHeadlineAr },
      { key: BUSINESS_SETTING_KEYS.homeSubtitleEn, value: d.homeSubtitleEn },
      { key: BUSINESS_SETTING_KEYS.homeSubtitleAr, value: d.homeSubtitleAr },
    ]);
  } catch {
    return { error: friendlyErr() };
  }

  revalidateSettingsPaths();
  return { success: "Homepage copy saved." };
}

export async function updateContactCopySettingsAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  await requireAdmin();
  const parsed = contactCopySettingsSchema.safeParse({
    contactIntroEn: formString(formData, "contactIntroEn"),
    contactIntroAr: formString(formData, "contactIntroAr"),
  });
  if (!parsed.success) return { error: zodErrorMessage(parsed) };

  try {
    const d = parsed.data;
    await upsertBusinessSettings([
      { key: BUSINESS_SETTING_KEYS.contactIntroEn, value: d.contactIntroEn },
      { key: BUSINESS_SETTING_KEYS.contactIntroAr, value: d.contactIntroAr },
    ]);
  } catch {
    return { error: friendlyErr() };
  }

  revalidateSettingsPaths();
  return { success: "Contact page copy saved." };
}
