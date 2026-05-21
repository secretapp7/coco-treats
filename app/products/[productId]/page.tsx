import { AppShell } from "@/components/app-shell";
import { ProductDetailClient } from "@/components/products/product-detail-client";
import { getProductDbIdBySlug, getStorefrontProductBySlug } from "@/lib/storefront/storefront-products";
import {
  getProductStorefrontReviews,
  getStorefrontRatingSummaries,
  ratingForProductSlug,
} from "@/lib/storefront/storefront-reviews";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { productId } = await params;
  const [product, productDbId, ratingSummaries] = await Promise.all([
    getStorefrontProductBySlug(productId),
    getProductDbIdBySlug(productId),
    getStorefrontRatingSummaries(),
  ]);

  const [reviews, rating] = await Promise.all([
    getProductStorefrontReviews(productId, productDbId, 3),
    Promise.resolve(ratingForProductSlug(ratingSummaries, productId)),
  ]);

  return (
    <AppShell>
      <ProductDetailClient key={productId} product={product} reviews={reviews} rating={rating} />
    </AppShell>
  );
}
