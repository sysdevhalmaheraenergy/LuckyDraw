import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { handleApiError, ApiError } from "@/lib/api-utils";

type Context = { params: Promise<{ eventId: string; number: string }> };

export async function PATCH(_request: Request, ctx: Context) {
  try {
    await requireAdmin();
    const { eventId, number } = await ctx.params;
    const couponNumber = Number(number);
    if (!Number.isInteger(couponNumber)) {
      throw new ApiError("Nomor kupon tidak valid.", 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { eventId_number: { eventId, number: couponNumber } },
    });
    if (!coupon) {
      throw new ApiError("Kupon tidak ditemukan.", 404);
    }
    if (coupon.status !== "EXCLUDED") {
      throw new ApiError("Hanya kupon yang dikecualikan yang bisa dipulihkan.", 400);
    }

    const updated = await prisma.coupon.update({
      where: { id: coupon.id },
      data: { status: "AVAILABLE" },
    });

    return NextResponse.json({ coupon: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
