import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { handleApiError, ApiError } from "@/lib/api-utils";
import { claimCouponSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    const user = await requireUser();

    const body = claimCouponSchema.parse(await request.json());

    const result = await prisma.$transaction(async (tx) => {
      const found = await tx.coupon.findUnique({
        where: { id: body.code },
        include: { event: true },
      });

      if (!found) {
        throw new ApiError("Kupon tidak ditemukan.", 404);
      }
      if (found.status !== "AVAILABLE") {
        throw new ApiError("Kupon sudah terpakai atau tidak tersedia.", 400);
      }
      if (found.userId) {
        throw new ApiError("Kupon sudah diklaim oleh pengguna lain.", 400);
      }

      return tx.coupon.update({
        where: { id: found.id },
        data: { userId: user.id },
        include: { event: true },
      });
    }, { timeout: 30000 });

    return NextResponse.json({ coupon: result, event: result.event }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}