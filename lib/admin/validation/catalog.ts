import { z } from "zod";
import { ProductImageType, ProductStatus } from "@prisma/client";

export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only");

export const omrSchema = z.coerce.number().min(0).max(999999.999);

export const productCoreSchema = z.object({
  slug: slugSchema,
  nameEn: z.string().trim().min(1, "English name is required").max(200),
  nameAr: z.string().trim().min(1, "Arabic name is required").max(200),
  descriptionEn: z.string().trim().min(1, "English description is required").max(8000),
  descriptionAr: z.string().trim().min(1, "Arabic description is required").max(8000),
  categoryId: z.string().cuid().optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  status: z.nativeEnum(ProductStatus),
  badgeEn: z.string().trim().max(120).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  badgeAr: z.string().trim().max(120).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  featured: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).default(0),
});

export const productSizeInputSchema = z.object({
  labelEn: z.string().trim().min(1).max(200),
  labelAr: z.string().trim().min(1).max(200),
  servesEn: z.string().trim().min(1).max(200),
  servesAr: z.string().trim().min(1).max(200),
  priceOmr: omrSchema,
  ingredientCostOmr: omrSchema.default(0),
  packagingCostOmr: omrSchema.default(0),
  laborCostOmr: omrSchema.default(0),
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).default(0),
  isActive: z.coerce.boolean().default(true),
});

export const imageInputSchema = z.object({
  url: z.string().trim().min(1).max(2000),
  type: z.nativeEnum(ProductImageType),
  altEn: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  altAr: z.string().trim().max(500).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).default(0),
});

export const categoryInputSchema = z.object({
  slug: slugSchema,
  nameEn: z.string().trim().min(1, "English name is required").max(200),
  nameAr: z.string().trim().min(1, "Arabic name is required").max(200),
  descriptionEn: z.string().trim().max(4000).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  descriptionAr: z.string().trim().max(4000).optional().or(z.literal("")).transform((v) => (v === "" ? undefined : v)),
  sortOrder: z.coerce.number().int().min(0).max(1_000_000).default(0),
  isActive: z.coerce.boolean().default(true),
});
