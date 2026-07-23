import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/api-utils";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    throw new ApiError("Belum login.", 401);
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new ApiError("Hanya admin yang boleh melakukan aksi ini.", 403);
  }
  return user;
}
