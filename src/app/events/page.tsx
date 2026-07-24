import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { StatusBadge } from "@/components/status-badge";

interface PublicEvent {
  id: string;
  name: string;
  description: string | null;
  status: string;
  totalCoupons: number;
  _count: { coupons: number; prizes: number };
}

async function getEvents(): Promise<PublicEvent[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/events/public`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.events;
  } catch {
    return [];
  }
}

export default async function PublicEventsPage() {
  const events = await getEvents();

  const ongoing = events.filter((e) => e.status === "ONGOING");
  const completed = events.filter((e) => e.status === "COMPLETED");

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-surface-alt"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Event Lucky Draw
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Daftar event lucky draw yang sedang berlangsung dan telah selesai.
          </p>

          {events.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-alt px-6 py-16 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="font-display text-lg font-semibold text-ink">Belum ada event</h2>
              <p className="max-w-sm text-sm text-ink-muted">
                Belum ada event lucky draw yang dipublikasikan.
              </p>
            </div>
          ) : (
            <>
              {ongoing.length > 0 && (
                <section className="mt-8">
                  <h2 className="font-display text-lg font-semibold text-ink">Sedang Berlangsung</h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {ongoing.map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="block rounded-2xl border border-border bg-surface-alt p-5 transition-colors duration-200 hover:border-brand/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-base font-semibold text-ink">{event.name}</h3>
                          <StatusBadge status={event.status} />
                        </div>
                        {event.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{event.description}</p>
                        )}
                        <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-xs text-ink-muted">
                          <span>{event._count.coupons} kupon</span>
                          <span>{event._count.prizes} hadiah</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {completed.length > 0 && (
                <section className="mt-10">
                  <h2 className="font-display text-lg font-semibold text-ink">Selesai</h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {completed.map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="block rounded-2xl border border-border bg-surface-alt p-5 transition-colors duration-200 hover:border-brand/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-display text-base font-semibold text-ink">{event.name}</h3>
                          <StatusBadge status={event.status} />
                        </div>
                        {event.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{event.description}</p>
                        )}
                        <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-xs text-ink-muted">
                          <span>{event._count.coupons} kupon</span>
                          <span>{event._count.prizes} hadiah</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}