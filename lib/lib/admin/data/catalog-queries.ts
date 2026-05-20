import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import type { ProductStatus } from "@prisma/client";

export type ProductListFilters = {
  q?: string;
  status?: ProductStatus;
  sort: "updated" | "created" | "sortOrder";
};

export async function getProductsForAdmin(filters: ProductListFilters) {
  const where: Prisma.ProductWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.q?.trim()) {
    const s = filters.q.trim();
    where.OR = [
      { slug: { contains: s, mode: "insensitive" } },
      { nameEn: { contains: s, mode: "insensitive" } },
      { nameAr: { contains: s, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    filters.sort === "sortOrder"
      ? [{ sortOrder: "asc" }, { updatedAt: "desc" }]
      : filters.sort === "created"
        ? [{ createdAt: "desc" }]
        : [{ updatedAt: "desc" }];

  return prisma.product.findMany({
    where,
    orderBy,
    include: {
      category: { select: { id: true, slug: true, nameEn: true } },
      _count: { select: { sizes: true, images: true } },
    },
  });
}

export async function getProductForAdmin(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      sizes: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
      images: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] },
    },
  });
}

export async function getCategoriesForSelect() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    select: { id: true, slug: true, nameEn: true, nameAr: true },
  });
}

export async function getCategoriesForAdmin(filters: { q?: string; active?: "yes" | "no" | "all" }) {
  const where: Prisma.CategoryWhereInput = {};
  if (filters.active === "yes") where.isActive = true;
  if (filters.active === "no") where.isActive = false;
  if (filters.q?.trim()) {
    const s = filters.q.trim();
    where.OR = [
      { slug: { contains: s, mode: "insensitive" } },
      { nameEn: { contains: s, mode: "insensitive" } },
      { nameAr: { contains: s, mode: "insensitive" } },
    ];
  }
  return prisma.category.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    include: {
      _count: { select: { products: true } },
    },
  });
}

export async function getCategoryForAdmin(id: string) {
  return prisma.category.findUnique({ where: { id } });
}
