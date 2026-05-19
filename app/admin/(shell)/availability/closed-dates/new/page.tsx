import Link from "next/link";

import { ClosedDateCreateForm } from "@/components/admin/availability/closed-date-forms";

export default function AdminClosedDateNewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--accent-cocoa)]">New closed period</h1>
          <p className="mt-1 text-sm text-[color:var(--muted-text)]">
            Uses UTC timestamps (same picker semantics as offers admin).
          </p>
        </div>
        <Link
          href="/admin/availability"
          className="rounded-xl border border-[color:var(--border-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-burgundy)] hover:bg-[color:var(--card-cream)]"
        >
          Back
        </Link>
      </div>
      <section className="rounded-2xl border border-[color:var(--border-soft)] bg-white/90 p-4 shadow-sm">
        <ClosedDateCreateForm />
      </section>
    </div>
  );
}
