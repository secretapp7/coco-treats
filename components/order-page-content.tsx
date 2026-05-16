"use client";

import { AppShell } from "@/components/app-shell";
import { ScreenEnter } from "@/components/motion/screen-enter";
import { OrderForm } from "@/components/order-form";
import { useAppLanguage } from "@/components/language-provider";

type OrderPageContentProps = {
  initialProductId?: string;
  initialSizeId?: string;
};

export function OrderPageContent({ initialProductId, initialSizeId }: OrderPageContentProps) {
  const { language } = useAppLanguage();

  return (
    <AppShell>
      <ScreenEnter className="pb-2 pt-1">
        <OrderForm
          key={`${initialProductId ?? "x"}-${initialSizeId ?? "x"}`}
          language={language}
          initialProductId={initialProductId}
          initialSizeId={initialSizeId}
        />
      </ScreenEnter>
    </AppShell>
  );
}
