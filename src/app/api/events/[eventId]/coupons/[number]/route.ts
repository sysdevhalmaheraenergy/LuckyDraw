import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { handleApiError, ApiError } from "@/lib/api-utils";

type Context = { params: Promise<{ eventId: string; number: string }> };

export async function DELETE(_request: Request, ctx: Context) {
  try {
    await requireAdmin();
    const { eventId, number } = await ctx.params;
    const couponNumber = Number(number);
    if (!Number.isInteger(couponNumber)) {
      throw new ApiError("Nomor kupon tidak valid.", 400);
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new ApiError("Event tidak ditemukan.", 404);
    }
    if (event.status !== "DRAFT") {
      throw new ApiError("Hanya kupon pada event draft yang bisa dihapus.", 400);
    }

    const coupon = await prisma.coupon.findUnique({
      where: { eventId_number: { eventId, number: couponNumber } },
    });
    if (!coupon) {
      throw new ApiError("Kupon tidak ditemukan.", 404);
    }
    if (coupon.status === "WON") {
      throw new ApiError("Kupon yang sudah menang tidak bisa dihapus.", 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.coupon.delete({ where: { id: coupon.id } });
      await tx.event.update({
        where: { id: eventId },
        data: { totalCoupons: { decrement: 1 } },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
