import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatusBadge } from "@/components/status-badge";

export default async function UserPrizesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/prizes");
  }

  const drawResults = await prisma.drawResult.findMany({
    where: {
      coupon: { userId: session.user.id },
      status: "VALID",
    },
    include: {
      prize: true,
      coupon: { include: { event: true } },
    },
    orderBy: { drawnAt: "desc" },
  });

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader user={session.user} />

      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Hadiah Saya
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {drawResults.length > 0
              ? `Kamu memenangkan ${drawResults.length} hadiah.`
              : "Belum ada hadiah yang dimenangkan."}
          </p>

          {drawResults.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface-alt px-6 py-16 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h2 className="font-display text-lg font-semibold text-ink">Belum ada hadiah</h2>
              <p className="max-w-sm text-sm text-ink-muted">
                Ikuti event lucky draw dan klaim kupon untuk berkesempatan memenangkan hadiah.
              </p>
              <Link
                href="/events"
                className="cursor-pointer rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-opacity duration-200 hover:opacity-90"
              >
                Lihat Event
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {drawResults.map((result) => (
                <div
                  key={result.id}
                  className="rounded-2xl border border-border bg-surface-alt p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base font-semibold text-ink">{result.prize.name}</h3>
                      <p className="text-xs text-ink-muted">{result.coupon.event.name}</p>
                    </div>
                    <StatusBadge status="WON" />
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-ink-muted">
                    <span>Kupon #{result.coupon.number}</span>
                    <span>{new Date(result.drawnAt).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}