import Link from "next/link";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { couponStatusSchema } from "@/lib/schemas";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatusBadge } from "@/components/status-badge";
import { EventStatusToggle } from "@/components/event-status-toggle";
import { PrizeActions } from "@/components/prize-actions";
import { Pagination } from "@/components/pagination";
import { CouponFilterBar } from "@/components/coupon-filter-bar";
import { CouponExcludeButton } from "./coupon-exclude-button";
import { CouponRestoreButton } from "./coupon-restore-button";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;

type Context = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; limit?: string; status?: string; search?: string }>;
};

export default async function EventDetailPage({ params, searchParams }: Context) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const { id } = await params;
  const { page: pageParam, limit: limitParam, status: statusParam, search: searchParam } = await searchParams;

  const page = Math.max(1, Number(pageParam) || DEFAULT_PAGE);
  let limit = Number(limitParam) || DEFAULT_LIMIT;
  if (!PAGE_SIZE_OPTIONS.includes(limit as (typeof PAGE_SIZE_OPTIONS)[number])) {
    limit = DEFAULT_LIMIT;
  }

  // Parse and validate status filter
  let statusFilter: string | undefined;
  if (statusParam) {
    const statusResult = couponStatusSchema.safeParse(statusParam);
    if (statusResult.success) {
      statusFilter = statusResult.data;
    }
  }

  // Parse search filter (exact coupon number match)
  let numberFilter: number | undefined;
  if (searchParam && searchParam.trim() !== "") {
    const num = Number(searchParam);
    if (!isNaN(num)) {
      numberFilter = num;
    }
  }

  // Build coupon filter for Prisma
  const hasFilter = !!statusFilter || numberFilter !== undefined;
  const couponWhere = {
    ...(statusFilter && { status: statusFilter as "AVAILABLE" | "WON" | "EXCLUDED" }),
    ...(numberFilter !== undefined && { number: numberFilter }),
  };

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      prizes: {
        orderBy: { drawOrder: "asc" },
        include: {
          drawResults: {
            where: { status: "VALID" },
            include: { coupon: true },
          },
        },
      },
      coupons: {
        where: couponWhere,
        orderBy: { number: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      },
      _count: {
        select: {
          coupons: hasFilter ? { where: couponWhere } : true,
          prizes: true,
        },
      },
    },
  });

  if (!event || event.userId !== session.user.id) {
    notFound();
  }

  const statusCounts = await prisma.coupon.groupBy({
    where: { eventId: id },
    by: ["status"],
    _count: true,
  });

  const counts = Object.fromEntries(statusCounts.map((s) => [s.status, s._count]));
  const totalExcluded = counts.EXCLUDED ?? 0;
  const totalWon = counts.WON ?? 0;
  const totalAvailable = counts.AVAILABLE ?? 0;

  return (
    <div className="relative flex min-h-screen flex-1 flex-col">
      {/* Liquid glass background overlay */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-brand/5 via-transparent to-emerald-500/5" />
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent opacity-30" />

      <DashboardHeader user={session.user} />

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/dashboard"
            className="mb-6 flex items-center gap-1.5 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {event.name}
                </h1>
                <StatusBadge status={event.status} />
              </div>
              {event.description && (
                <p className="mt-1 text-sm text-ink-muted">{event.description}</p>
              )}
            </div>
            <EventStatusToggle
              eventId={event.id}
              currentStatus={event.status}
              hasPrizes={event.prizes.length > 0}
            />
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div className="group rounded-2xl border border-border/50 bg-surface/50 p-4 shadow-card backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated hover:border-brand/30">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft/50 text-brand">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M20 7l-8-5-8 5v10l8 5 8-5z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <p className="text-xs text-ink-muted">Total Kupon</p>
              <p className="font-display text-xl font-bold text-ink">{event.totalCoupons}</p>
            </div>
            <div className="group rounded-2xl border border-border/50 bg-surface/50 p-4 shadow-card backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated hover:border-brand/30">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-xs text-ink-muted">Tersedia</p>
              <p className="font-display text-xl font-bold text-emerald-500">{totalAvailable}</p>
            </div>
            <div className="group rounded-2xl border border-border/50 bg-surface/50 p-4 shadow-card backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated hover:border-brand/30">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M12 17v.01M12 13v-3M12 7h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-xs text-ink-muted">Dimenangkan</p>
              <p className="font-display text-xl font-bold text-brand">{totalWon}</p>
            </div>
            <div className="group rounded-2xl border border-border/50 bg-surface/50 p-4 shadow-card backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated hover:border-brand/30">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-danger/10 text-danger">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <p className="text-xs text-ink-muted">Dikecualikan</p>
              <p className="font-display text-xl font-bold text-danger">{totalExcluded}</p>
            </div>
            <div className="group rounded-2xl border border-border/50 bg-surface/50 p-4 shadow-card backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated hover:border-brand/30">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <path d="M12 17.27L18.18 11 12 6.73 5.82 11z" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <p className="text-xs text-ink-muted">Hadiah</p>
              <p className="font-display text-xl font-bold text-ink">{event.prizes.length}</p>
            </div>
          </div>

          {/* Prizes Section */}
          <section className="mt-8 sm:mt-10">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Hadiah</h2>
              {event.status === "DRAFT" && (
                <Link
                  href={`/dashboard/events/${event.id}/prizes/new`}
                  className="cursor-pointer rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:scale-105 hover:opacity-90"
                >
                  + Tambah Hadiah
                </Link>
              )}
            </div>

            {event.prizes.length === 0 ? (
              <div className="mt-4 rounded-2xl border-2 border-dashed border-border/50 bg-surface/50 p-8 text-center shadow-card backdrop-blur-xl sm:p-12">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-surface-alt text-brand">
                  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-ink">Belum ada hadiah</h3>
                <p className="mt-1 max-w-sm text-sm text-ink-muted">
                  Tambah hadiah pertama untuk event ini.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {event.prizes.map((prize) => {
                  const validDraw = prize.drawResults[0];
                  return (
                    <div
                      key={prize.id}
                      className="group relative rounded-2xl border border-border/50 bg-surface/50 p-5 shadow-card backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated hover:border-brand/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display text-base font-semibold text-ink">{prize.name}</h3>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={prize.status} />
                          {event.status === "DRAFT" && prize.status === "PENDING" && (
                            <PrizeActions
                              eventId={event.id}
                              prizeId={prize.id}
                              prizeName={prize.name}
                            />
                          )}
                        </div>
                      </div>
                      {prize.description && (
                        <p className="mt-1 text-sm text-ink-muted">{prize.description}</p>
                      )}
                      {prize.imageUrl && (
                        <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-border/50">
                          <img
                            src={prize.imageUrl}
                            alt={prize.name}
                            className="h-32 w-full object-cover transition-transform duration-200 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                        <span>                        Undian ke-{prize.drawOrder}</span>
                        {validDraw && (
                          <span className="font-semibold text-emerald-500">
                            Pemenang: #{validDraw.coupon.number}
                          </span>
                        )}
                      </div>
                      {validDraw?.note && validDraw.note.trim() && (
                        <div className="mt-3 rounded-xl bg-surface-alt/50 p-3">
                          <p className="text-xs font-semibold text-ink-muted">Catatan:</p>
                          <p className="mt-1 text-sm text-ink whitespace-pre-wrap break-words">
                            {validDraw.note}
                          </p>
                        </div>
                      )}
                      {event.status === "ONGOING" && prize.status === "PENDING" && (
                        <Link
                          href={`/dashboard/events/${event.id}/draw`}
                          className="mt-3 block cursor-pointer rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand transition-all duration-200 hover:bg-brand/20"
                        >
                          Undi
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Coupons Section */}
          <section className="mt-8 sm:mt-10">
            <h2 className="font-display text-lg font-semibold text-ink">Kupon</h2>
            <p className="text-xs text-ink-muted">
              {totalAvailable} tersedia, {totalWon} menang, {totalExcluded} dikecualikan
            </p>

            <CouponFilterBar currentStatus={statusFilter ?? ""} currentSearch={searchParam ?? ""} />

            {event.coupons.length === 0 ? (
              <div className="mt-4 rounded-2xl border-2 border-dashed border-border/50 bg-surface/50 p-8 text-center shadow-card backdrop-blur-xl sm:p-12">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-surface-alt text-brand">
                  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-ink">Tidak ada kupon</h3>
                <p className="mt-1 max-w-sm text-sm text-ink-muted">
                  Halaman ini tidak memiliki kupon. Coba halaman lain atau ubah filter.
                </p>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-border/50 bg-surface/50 shadow-card backdrop-blur-xl">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-surface-alt/50">
                      <th className="px-4 py-3 font-semibold text-ink">No.</th>
                      <th className="px-4 py-3 font-semibold text-ink">Status</th>
                      <th className="px-4 py-3 font-semibold text-ink">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.coupons.map((coupon) => (
                      <tr key={coupon.id} className="border-b border-border/50 last:border-b-0 transition-colors duration-200 hover:bg-brand-soft/5">
                        <td className="px-4 py-3 font-display font-semibold text-ink">#{coupon.number}</td>
                        <td className="px-4 py-3"><StatusBadge status={coupon.status} /></td>
                        <td className="px-4 py-3">
                          {coupon.status === "AVAILABLE" && event.status === "DRAFT" && (
                            <CouponExcludeButton eventId={event.id} couponNumber={coupon.number} />
                          )}
                          {coupon.status === "EXCLUDED" && event.status === "DRAFT" && (
                            <CouponRestoreButton eventId={event.id} couponNumber={coupon.number} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              currentPage={page}
              totalPages={Math.max(1, Math.ceil(event._count.coupons / limit))}
              total={event._count.coupons}
              pageSize={limit}
              pageSizeOptions={[10, 25, 50]}
              baseUrl={`/dashboard/events/${event.id}`}
              extraParams={{
                ...(statusFilter && { status: statusFilter }),
                ...(searchParam && { search: searchParam }),
              }}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
