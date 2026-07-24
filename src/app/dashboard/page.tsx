import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BrandMark } from "@/components/brand-mark";
import { SignOutButton } from "@/components/sign-out-button";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-ink-muted/10 text-ink-muted",
  ONGOING: "bg-accent/15 text-accent",
  COMPLETED: "bg-emerald-500/15 text-emerald-500",
};

const statusLabels: Record<string, string> = {
  DRAFT: "Draft",
  ONGOING: "Berlangsung",
  COMPLETED: "Selesai",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const events = await prisma.event.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { coupons: true, prizes: true } } },
  });

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/">
            <BrandMark />
          </Link>
          <div className="flex items-center gap-4">
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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Halo, {(session.user.name ?? session.user.email ?? "").split(" ")[0]}
              </h1>
              <p className="mt-1 text-sm text-ink-muted">
                {events.length > 0
                  ? `Kamu punya ${events.length} event lucky draw.`
                  : "Belum ada event. Buat lewat API POST /api/events untuk memulai."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/events/new"
                className="cursor-pointer rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
              >
                + Buat Event
              </Link>
              <Link
                href="/api-docs"
                className="cursor-pointer rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 hover:bg-surface-alt"
              >
                API Docs
              </Link>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-alt px-6 py-16 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h2 className="font-display text-lg font-semibold text-ink">Belum ada event</h2>
              <p className="max-w-sm text-sm text-ink-muted">
                Event pertamamu bisa dibuat lewat endpoint{" "}
                <code className="rounded bg-surface px-1.5 py-0.5 text-xs text-brand">POST /api/events</code> di
                dokumentasi API.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="block rounded-2xl border border-border bg-surface-alt p-5 transition-colors duration-200 hover:border-brand/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-base font-semibold text-ink">{event.name}</h3>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[event.status]}`}
                    >
                      {statusLabels[event.status]}
                    </span>
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
          )}
        </div>
      </main>
    </div>
  );
}
