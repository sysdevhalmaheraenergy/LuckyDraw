import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard-header";
import { EventFilterBar } from "@/components/event-filter-bar";
import { UserFilterSelect } from "@/components/user-filter-select";

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; userId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const { status, userId } = await searchParams;
  const isSuperAdmin = session.user.role === "SUPERADMIN";

  const VALID_STATUSES = ["DRAFT", "ONGOING", "COMPLETED"] as const;
  const statusFilter = VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])
    ? { status: status as (typeof VALID_STATUSES)[number] }
    : {};

  const users = isSuperAdmin
    ? await prisma.user.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      })
    : null;

  const VALID_USER_IDS = new Set(users?.map((u) => u.id) ?? []);
  const userFilter =
    isSuperAdmin && userId && VALID_USER_IDS.has(userId) ? { userId } : {};

  const where = isSuperAdmin
    ? { ...statusFilter, ...userFilter }
    : { userId: session.user.id, ...statusFilter };

  const events = await prisma.event.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { coupons: true, prizes: true } },
      user: { select: { name: true, email: true } },
    },
  });

  const filterUser =
    userId && users?.some((u) => u.id === userId)
      ? users.find((u) => u.id === userId)
      : undefined;

  const filterSummary = (() => {
    const parts: string[] = [];
    if (status) parts.push(statusLabels[status] ?? status);
    if (filterUser) parts.push(`oleh ${filterUser.name ?? filterUser.email ?? "pengguna"}`);
    if (parts.length > 0) {
      return `Menampilkan ${events.length} event (${parts.join(", ")}).`;
    }
    return events.length > 0
      ? `Kamu punya ${events.length} event lucky draw.`
      : "Belum ada event. Buat lewat API POST /api/events untuk memulai.";
  })();

  return (
    <div className="relative flex flex-1 flex-col">
      {/* Glass background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-brand/5 via-transparent to-emerald-500/5" />

      <DashboardHeader user={session.user} showDashboardLink={false} />

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Halo, {(session.user.name ?? session.user.email ?? "").split(" ")[0]}
              </h1>
              <p className="mt-1 text-sm text-ink-muted">
                {filterSummary}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/events/new"
                className="cursor-pointer rounded-full bg-gradient-to-br from-brand to-brand-2 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
              >
                + Buat Event
              </Link>
            </div>
          </div>

          <EventFilterBar currentStatus={status ?? ""} />

          {isSuperAdmin && users && (
            <UserFilterSelect
              users={users}
              currentUserId={userId ?? ""}
            />
          )}

          {events.length === 0 ? (
            <div className="mt-8 sm:mt-10 rounded-2xl border border-dashed border-border/50 bg-white/30 p-6 text-center backdrop-blur-xl sm:p-8">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h2 className="mt-3 font-display text-lg font-semibold text-ink">Belum ada event</h2>
              {/* <p className="mt-1 max-w-sm text-sm text-ink-muted">
                Event pertamamu bisa dibuat lewat endpoint{" "}
                <code className="rounded bg-surface/50 px-1.5 py-0.5 text-xs text-brand">POST /api/events</code> di
                dokumentasi API.
              </p> */}
            </div>
          ) : (
            <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="block rounded-2xl border border-border/50 bg-white/30 p-5 backdrop-blur-xl transition-all duration-300 hover:border-brand/30 hover:bg-white/40"
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
                   <div className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
                     <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 flex-shrink-0" aria-hidden="true">
                       <path
                         d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4ZM12 14c-4.41 0-8 2.24-8 5v3h16v-3c0-2.76-3.59-5-8-5Z"
                         stroke="currentColor"
                         strokeWidth="1.8"
                         strokeLinecap="round"
                         strokeLinejoin="round"
                       />
                     </svg>
                     <span>oleh {event.user?.name ?? event.user?.email ?? "—"}</span>
                     <span className="opacity-40">•</span>
                     <time dateTime={event.createdAt.toISOString()}>
                       {new Date(event.createdAt).toLocaleDateString("id-ID", {
                         day: "numeric",
                         month: "short",
                         year: "numeric",
                       })}
                     </time>
                   </div>
                   <div className="mt-4 flex items-center gap-4 border-t border-border/50 pt-4 text-xs text-ink-muted">
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
