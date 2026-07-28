import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { SignOutButton } from "@/components/sign-out-button";

type User = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

type DashboardHeaderProps = {
  user?: User;
  showDashboardLink?: boolean;
  rightSlot?: React.ReactNode;
};

export function DashboardHeader({
  user,
  showDashboardLink = true,
  rightSlot,
}: DashboardHeaderProps) {
  const displayName = user?.name ?? user?.email ?? "";
  const showUserInfo = !!user;

  return (
    <header className="sticky top-4 z-50 mx-4 sm:mx-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl border border-border/50 bg-white/30 px-4 py-3 shadow-glass backdrop-blur-xl sm:px-6">
        <Link href="/" aria-label="LuckyDraw beranda">
          <BrandMark />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          {showDashboardLink && (
            <Link
              href="/dashboard"
              className="cursor-pointer rounded-full border border-border/50 bg-white/20 px-4 py-2 text-sm font-semibold text-ink transition-all duration-200 hover:bg-white/30"
            >
              Dashboard
            </Link>
          )}
          {rightSlot}
          {showUserInfo && (
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-ink">{displayName}</p>
              {user?.role && (
                <p className="text-xs text-ink-muted">{user.role}</p>
              )}
            </div>
          )}
          {showUserInfo && <SignOutButton />}
        </div>
      </div>
    </header>
  );
}
