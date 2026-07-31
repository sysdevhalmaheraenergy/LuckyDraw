import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardHeader } from "@/components/dashboard-header";
import { UserActions } from "@/components/user-actions";

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  SUPERADMIN: "Super Admin",
  STAFF: "Staff",
};

const roleStyles: Record<string, string> = {
  ADMIN: "bg-brand/15 text-brand",
  SUPERADMIN: "bg-brand/20 text-brand-2",
  STAFF: "bg-ink-muted/10 text-ink-muted",
};

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/users");
  }

  if (session.user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="relative flex min-h-screen flex-1 flex-col">
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

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                Kelola Pengguna
              </h1>
              <p className="mt-1 text-sm text-ink-muted">
                {users.length} pengguna terdaftar.
              </p>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 overflow-x-auto rounded-2xl border border-border/50 bg-surface/50 shadow-card backdrop-blur-xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-surface-alt/50">
                  <th className="px-4 py-3 font-semibold text-ink">Nama</th>
                  <th className="px-4 py-3 font-semibold text-ink">Email</th>
                  <th className="px-4 py-3 font-semibold text-ink">Role</th>
                  <th className="px-4 py-3 font-semibold text-ink">Tanggal Daftar</th>
                  <th className="px-4 py-3 font-semibold text-ink">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                <tr className="border-b border-border/50 last:border-b-0 transition-colors duration-200 hover:bg-brand-soft/5" key={user.id}>
                  <td className="px-4 py-3 font-display font-semibold text-ink">{user.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyles[user.role] ?? roleStyles.STAFF}`}>
                      {roleLabels[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{new Date(user.createdAt).toLocaleDateString("id-ID")}</td>
                  <td className="px-4 py-3">
                    <UserActions
                      userId={user.id}
                      userName={user.name}
                      userEmail={user.email}
                      userRole={user.role}
                    />
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
