import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BrandMark } from "@/components/brand-mark";
import { StatusBadge } from "@/components/status-badge";

type Context = { params: Promise<{ id: string }> };

export default async function PublicEventDetailPage({ params }: Context) {
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
    },
  });

  if (!event || event.status === "DRAFT") {
    notFound();
  }

  const drawnPrizes = event.prizes.filter((p) => p.status === "DRAWN");

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/events"
              className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-surface-alt"
            >
              Semua Event
            </Link>
            <Link
              href="/login"
              className="cursor-pointer rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {event.name}
            </h1>
            <StatusBadge status={event.status} />
          </div>
          {event.description && (
            <p className="mt-2 text-sm text-ink-muted">{event.description}</p>
          )}

          {event.status === "ONGOING" && (
            <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/5 p-6">
              <h2 className="font-display text-lg font-semibold text-ink">Event Sedang Berlangsung</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Punya kode kupon? Klaim sekarang untuk mengikuti undian.
              </p>
              <Link
                href="/coupons/claim"
                className="mt-4 inline-block cursor-pointer rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
              >
                Klaim Kupon
              </Link>
            </div>
          )}

          {/* Prizes / Winners */}
          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold text-ink">
              {event.status === "COMPLETED" ? "Pemenang" : "Daftar Hadiah"}
            </h2>

            {drawnPrizes.length === 0 ? (
              <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-surface-alt px-6 py-12 text-center">
                <h3 className="font-display text-base font-semibold text-ink">Belum ada pemenang</h3>
                <p className="max-w-sm text-sm text-ink-muted">
                  Hasil undian akan ditampilkan di sini setelah pengundian dilakukan.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {drawnPrizes.map((prize) => {
                  const validDraw = prize.drawResults[0];
                  return (
                    <div
                      key={prize.id}
                      className="rounded-2xl border border-border bg-surface-alt p-5"
                    >
                      {prize.imageUrl && (
                        <img
                          src={prize.imageUrl}
                          alt={prize.name}
                          className="mb-3 h-48 w-full rounded-xl object-contain"
                        />
                      )}
                      <h3 className="font-display text-base font-semibold text-ink">{prize.name}</h3>
                      {prize.description && (
                        <p className="mt-1 text-sm text-ink-muted">{prize.description}</p>
                      )}
                      {validDraw && (
                        <div className="mt-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-center">
                          <p className="text-xs text-ink-muted">Pemenang</p>
                          <p className="font-display text-lg font-bold text-emerald-500">
                            #{validDraw.coupon.number}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}