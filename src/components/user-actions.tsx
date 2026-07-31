"use client";

import { useState } from "react";
import { UserEditModal } from "@/components/user-edit-modal";

interface UserActionsProps {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
}

export function UserActions({ userId, userName, userEmail, userRole }: UserActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="cursor-pointer rounded-lg border border-border/50 bg-white/20 px-3 py-1.5 text-xs font-semibold text-ink transition-all duration-200 hover:border-brand/40 hover:bg-white/30"
        aria-label={`Edit ${userName}`}
      >
        Edit
      </button>

      <UserEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        initialName={userName}
        initialEmail={userEmail}
        initialRole={userRole}
      />
    </>
  );
}
