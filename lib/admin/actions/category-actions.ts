"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";

import { requireAdmin } from "@/lib/auth/admin-session";
import { categoryInputSchema } from "@/lib/admin/validation/catalog";
import { prisma } from "@/lib/db/prisma";

export type ActionResult = { ok: true } | { ok: false; error: string };

function friendlyPrismaError(e: unknown): string {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    return "That slug is already in use.";
  }
  return "Something went wrong. Please try again.";
}

export async function createCategoryAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = categoryInputSchema.safeParse({
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    nameEn: String(formData.get("nameEn") ?? ""),
    nameAr: String(formData.get("nameAr") ?? ""),
    descriptionEn: String(formData.get("descriptionEn") ?? ""),
    descriptionAr: String(formData.get("descriptionAr") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isActive: formData.has("isActive"),
  });
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(" ") || "Invalid input.";
    return { ok: false, error: msg };
  }
  try {
    await prisma.category.create({
      data: {
        slug: parsed.data.slug,
        nameEn: parsed.data.nameEn.trim(),
        nameAr: parsed.data.nameAr.trim(),
        descriptionEn: parsed.data.descriptionEn,
        descriptionAr: parsed.data.descriptionAr,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyPrismaError(e) };
  }
}

export type CategoryFormState = { error?: string };

export async function createCategoryFormAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const r = await createCategoryAction(formData);
  if (!r.ok) {
    return { error: r.error };
  }
  redirect("/admin/categories");
}

export async function updateCategoryAction(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing category." };
  const parsed = categoryInputSchema.safeParse({
    slug: String(formData.get("slug") ?? "").trim().toLowerCase(),
    nameEn: String(formData.get("nameEn") ?? ""),
    nameAr: String(formData.get("nameAr") ?? ""),
    descriptionEn: String(formData.get("descriptionEn") ?? ""),
    descriptionAr: String(formData.get("descriptionAr") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isActive: formData.has("isActive"),
  });
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(" ") || "Invalid input.";
    return { ok: false, error: msg };
  }
  try {
    await prisma.category.update({
      where: { id },
      data: {
        slug: parsed.data.slug,
        nameEn: parsed.data.nameEn.trim(),
        nameAr: parsed.data.nameAr.trim(),
        descriptionEn: parsed.data.descriptionEn,
        descriptionAr: parsed.data.descriptionAr,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      },
    });
    revalidatePath("/admin/categories");
    revalidatePath(`/admin/categories/${id}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendlyPrismaError(e) };
  }
}

export async function updateCategoryFormAction(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const r = await updateCategoryAction(formData);
  if (!r.ok) {
    return { error: r.error };
  }
  redirect("/admin/categories");
}
