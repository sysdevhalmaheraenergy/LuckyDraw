"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
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
          {user?.role === "SUPERADMIN" && (
            <Link
              href="/dashboard/users"
              className="cursor-pointer rounded-full border border-border/50 bg-white/20 px-4 py-2 text-sm font-semibold text-ink transition-all duration-200 hover:bg-white/30"
            >
              Users
            </Link>
          )}
          {rightSlot}
          {showUserInfo && <UserDropdown user={user} />}
        </div>
      </div>
    </header>
  );
}

function UserDropdown({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        aria-expanded={open}
        aria-label="Menu pengguna"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-white/30 text-ink transition-all duration-200 hover:bg-white/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4ZM12 14c-4.41 0-8 2.24-8 5v3h16v-3c0-2.76-3.59-5-8-5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl border border-border/50 bg-white/95 p-2 shadow-glass backdrop-blur-xl"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <div className="px-3 py-2 border-b border-border/50">
            <p className="text-sm font-semibold text-ink">
              {user.name ?? user.email}
            </p>
            {user.role && (
              <p className="text-xs font-semibold text-ink">{user.role}</p>
            )}
          </div>
          <SignOutButton />
        </div>
      )}
    </div>
  );
}
