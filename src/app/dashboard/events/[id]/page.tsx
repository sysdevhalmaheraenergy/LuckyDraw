import Link from "next/link";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BrandMark } from "@/components/brand-mark";
import { SignOutButton } from "@/components/sign-out-button";
import { StatusBadge } from "@/components/status-badge";
import { EventStatusToggle } from "@/components/event-status-toggle";
import { PrizeActions } from "@/components/prize-actions";
import { CouponExcludeButton } from "./coupon-exclude-button";

type Context = { params: Promise<{ id: string }> };

export default async function EventDetailPage({ params }: Context) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const { id } = await params;

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
        orderBy: { number: "asc" },
        take: 200,
      },
      _count: { select: { coupons: true, prizes: true } },
    },
  });

  if (!event || event.userId !== session.user.id) {
    notFound();
  }

  const totalExcluded = event.coupons.filter((c) => c.status === "EXCLUDED").length;
  const totalWon = event.coupons.filter((c) => c.status === "WON").length;
  const totalAvailable = event.coupons.filter((c) => c.status === "AVAILABLE").length;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-surface-alt"
            >
              Dashboard
            </Link>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">{session.user.name ?? session.user.email}</p>
              <p className="text-xs text-ink-muted">{session.user.role}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
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
              <div className="flex items-center gap-3">
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
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="rounded-2xl border border-border bg-surface-alt p-4">
              <p className="text-xs text-ink-muted">Total Kupon</p>
              <p className="font-display text-xl font-bold text-ink">{event.totalCoupons}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-alt p-4">
              <p className="text-xs text-ink-muted">Tersedia</p>
              <p className="font-display text-xl font-bold text-emerald-500">{totalAvailable}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-alt p-4">
              <p className="text-xs text-ink-muted">Dimenangkan</p>
              <p className="font-display text-xl font-bold text-brand">{totalWon}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-alt p-4">
              <p className="text-xs text-ink-muted">Dikecualikan</p>
              <p className="font-display text-xl font-bold text-danger">{totalExcluded}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-alt p-4">
              <p className="text-xs text-ink-muted">Hadiah</p>
              <p className="font-display text-xl font-bold text-ink">{event.prizes.length}</p>
            </div>
          </div>

          {/* Prizes Section */}
          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Hadiah</h2>
              {event.status === "DRAFT" && (
                <Link
                  href={`/dashboard/events/${event.id}/prizes/new`}
                  className="cursor-pointer rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
                >
                  + Tambah Hadiah
                </Link>
              )}
            </div>

            {event.prizes.length === 0 ? (
              <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface-alt px-6 py-12 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="font-display text-base font-semibold text-ink">Belum ada hadiah</h3>
                <p className="max-w-sm text-sm text-ink-muted">
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
                      className="rounded-2xl border border-border bg-surface-alt p-5"
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
                        <img
                          src={prize.imageUrl}
                          alt={prize.name}
                          className="mt-3 h-32 w-full rounded-xl object-cover"
                        />
                      )}
                      <div className="mt-3 flex items-center gap-3 text-xs text-ink-muted">
                        <span>Undian ke-{prize.drawOrder + 1}</span>
                        {validDraw && (
                          <span className="font-semibold text-emerald-500">
                            Pemenang: #{validDraw.coupon.number}
                          </span>
                        )}
                      </div>
                      {event.status === "ONGOING" && prize.status === "PENDING" && (
                        <Link
                          href={`/dashboard/events/${event.id}/draw`}
                          className="mt-3 block cursor-pointer rounded-lg bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand transition-colors duration-200 hover:bg-brand/20"
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
          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold text-ink">Kupon</h2>
            <p className="text-xs text-ink-muted">
              Menampilkan 200 kupon pertama ({totalAvailable} tersedia, {totalWon} menang, {totalExcluded} dikecualikan)
            </p>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="px-4 py-3 font-semibold text-ink">No.</th>
                    <th className="px-4 py-3 font-semibold text-ink">Status</th>
                    <th className="px-4 py-3 font-semibold text-ink">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {event.coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-border last:border-b-0 hover:bg-surface/50">
                      <td className="px-4 py-3 font-display font-semibold text-ink">#{coupon.number}</td>
                      <td className="px-4 py-3"><StatusBadge status={coupon.status} /></td>
                      <td className="px-4 py-3">
                        {coupon.status === "AVAILABLE" && event.status === "DRAFT" && (
                          <CouponExcludeButton eventId={event.id} couponNumber={coupon.number} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}