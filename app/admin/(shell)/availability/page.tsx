import Link from "next/link";

import { AvailabilitySettingsForm } from "@/components/admin/availability/availability-settings-form";
import {
  addUtcCalendarDays,
  getAvailabilityCalendarRange,
  loadAvailabilitySettings,
  utcIsoToday,
} from "@/lib/availability/availability-service";
import type { AvailabilityStatus } from "@/lib/availability/public-types";
import { prisma } from "@/lib/db/prisma";

function statusTone(status: AvailabilityStatus): string {
  switch (status) {
    case "AVAILABLE":
      return "text-emerald-800";
    case "FEW_SLOTS_LEFT":
      return "text-amber-900";
    case "FULLY_BOOKED":
    case "CLOSED":
    case "TOO_SOON":
    case "LARGE_ORDER_NEEDS_MORE_NOTICE":
      return "text-[color:var(--brand-burgundy-soft)]";
    default:
      return "text-[color:var(--muted-text)]";
  }
}

export default async function AdminAvailabilityPage() {
  const settings = await loadAvailabilitySettings();
  const start = utcIsoToday();
  const end = addUtcCalendarDays(start, 13);
  const calendar = await getAvailabilityCalendarRange(start, end, 1);

  const [closedRows, overrideRows] = await Promise.all([
    prisma.closedDate.findMany({
      orderBy: { startsAt: "desc" },
      take: 40,
    }),
    prisma.dailyCapacityOverride.findMany({
      orderBy: { date: "desc" },
      take: 40,
    }),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[color:var(--accent-cocoa)]">Availability & capacity</h1>
          <p className="mt-1 text-sm text-[color:var(--muted-text)]">
            UTC calendar rules · cancelled orders never consume slots · archiving keeps capacity history.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/availability/closed-dates/new"
            className="rounded-xl bg-[color:var(--brand-burgundy)] px-4 py-2 text-sm font-semibold text-[color:var(--card-cream)] hover:brightness-110"
          >
            Add closed period
          </Link>
          <Link
            href="/admin/availability/capacity/new"
            className="rounded-xl border border-[color:var(--border-soft)] px-4 py-2 text-sm font-semibold text-[color:var(--brand-burgundy)] hover:bg-[color:var(--card-cream)]"
          >
            Add capacity override
          </Link>
        </div>
      </div>

      <section className="rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--card-beige)] p-4 shadow-sm">
        <h2 className="text-xs font-bold uppercase tracking-wide text-[color:var(--brand-gold-muted)]">
          Global settings
        </h2>
        <div className="mt-3">
          <AvailabilitySettingsForm
            minimumNoticeDays={settings.minimumNoticeDays}
            defaultDailyOrderLimit={settings.defaultDailyOrderLimit}
            largeOrderNoticeDays={settings.largeOrderNoticeDays}
            largeOrderQuantityThreshold={settings.largeOrderQuantityThreshold}
          />
        </div>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-[color:var(--border-soft)] bg-white/90 shadow-sm">
        <h2 className="border-b border-[color:var(--border-soft)] bg-[color:var(--card-beige)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[color:var(--brand-gold-muted)]">
          Next 14 days ({start} → {end})
        </h2>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border-soft)] text-[10px] font-bold uppercase text-[color:var(--brand-gold-muted)]">
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2 text-right">Used</th>
              <th className="px-3 py-2 text-right">Max</th>
              <th className="px-3 py-2 text-right">Left</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {calendar.map((row) => (
              <tr key={row.dateIso} className="border-b border-[color:var(--border-soft)]/70">
                <td className="px-3 py-1.5 font-mono text-xs">{row.dateIso}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{row.usedSlots}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {row.maxOrders > 0 ? row.maxOrders : "∞"}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {row.maxOrders > 0 ? row.remainingSlots : "—"}
                </td>
                <td className={`px-3 py-1.5 text-xs font-semibold ${statusTone(row.status)}`}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-[color:var(--border-soft)] bg-white/90 shadow-sm">
        <h2 className="border-b border-[color:var(--border-soft)] bg-[color:var(--card-beige)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[color:var(--brand-gold-muted)]">
          Closed periods
        </h2>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border-soft)] text-[10px] font-bold uppercase text-[color:var(--brand-gold-muted)]">
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">Starts</th>
              <th className="px-3 py-2">Ends</th>
              <th className="px-3 py-2">Notes</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {closedRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-[color:var(--muted-text)]">
                  No closed periods yet.
                </td>
              </tr>
            ) : (
              closedRows.map((c) => (
                <tr key={c.id} className="border-b border-[color:var(--border-soft)]/70">
                  <td className="px-3 py-1.5 text-xs">{c.isActive ? "Yes" : "No"}</td>
                  <td className="px-3 py-1.5 font-mono text-[11px] text-[color:var(--muted-text)]">
                    {c.startsAt.toISOString().slice(0, 16).replace("T", " ")}
                  </td>
                  <td className="px-3 py-1.5 font-mono text-[11px] text-[color:var(--muted-text)]">
                    {c.endsAt.toISOString().slice(0, 16).replace("T", " ")}
                  </td>
                  <td className="max-w-[14rem] truncate px-3 py-1.5 text-xs" title={c.reasonEn ?? ""}>
                    {c.reasonEn ?? "—"}
                  </td>
                  <td className="px-3 py-1.5">
                    <Link
                      href={`/admin/availability/closed-dates/${c.id}`}
                      className="text-xs font-semibold text-[color:var(--brand-burgundy-soft)] hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section className="overflow-x-auto rounded-2xl border border-[color:var(--border-soft)] bg-white/90 shadow-sm">
        <h2 className="border-b border-[color:var(--border-soft)] bg-[color:var(--card-beige)] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[color:var(--brand-gold-muted)]">
          Daily capacity overrides
        </h2>
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-[color:var(--border-soft)] text-[10px] font-bold uppercase text-[color:var(--brand-gold-muted)]">
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">Date (UTC)</th>
              <th className="px-3 py-2 text-right">Max</th>
              <th className="px-3 py-2">EN note</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {overrideRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-[color:var(--muted-text)]">
                  No overrides yet.
                </td>
              </tr>
            ) : (
              overrideRows.map((o) => (
                <tr key={o.id} className="border-b border-[color:var(--border-soft)]/70">
                  <td className="px-3 py-1.5 text-xs">{o.isActive ? "Yes" : "No"}</td>
                  <td className="px-3 py-1.5 font-mono text-xs">{o.date.toISOString().slice(0, 10)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">{o.maxOrders}</td>
                  <td className="max-w-[12rem] truncate px-3 py-1.5 text-xs" title={o.noteEn ?? ""}>
                    {o.noteEn ?? "—"}
                  </td>
                  <td className="px-3 py-1.5">
                    <Link
                      href={`/admin/availability/capacity/${o.id}`}
                      className="text-xs font-semibold text-[color:var(--brand-burgundy-soft)] hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
