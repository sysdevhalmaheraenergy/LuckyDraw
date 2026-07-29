import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { handleApiError, ApiError } from "@/lib/api-utils";

type Context = { params: Promise<{ eventId: string; prizeId: string }> };

export async function POST(_request: Request, ctx: Context) {
  try {
    await requireAdmin();
    const { eventId, prizeId } = await ctx.params;

    const drawResult = await prisma.$transaction(
      async (tx) => {
        const prize = await tx.prize.findFirst({ where: { id: prizeId, eventId } });
        if (!prize) {
          throw new ApiError("Hadiah tidak ditemukan.", 404);
        }
        if (prize.status !== "PENDING") {
          throw new ApiError("Hadiah ini sudah diundi.", 400);
        }

        const availableCount = await tx.coupon.count({
          where: { eventId, status: "AVAILABLE" },
        });
        if (availableCount === 0) {
          throw new ApiError("Tidak ada kupon tersisa untuk diundi.", 400);
        }

        const [coupon] = await tx.$queryRaw<
          Array<{ id: string; number: number }>
        >`SELECT id, number FROM "Coupon" WHERE "eventId" = ${eventId} AND status = 'AVAILABLE' ORDER BY RANDOM() LIMIT 1`;

        const updated = await tx.coupon.updateMany({
          where: { id: coupon.id, status: "AVAILABLE" },
          data: { status: "WON" },
        });
        if (updated.count === 0) {
          throw new ApiError("Gagal mengundi, silakan coba lagi.", 409);
        }

        await tx.prize.update({ where: { id: prizeId }, data: { status: "DRAWN" } });

        return tx.drawResult.create({
          data: { prizeId, couponId: coupon.id },
          include: { coupon: true, prize: true },
        });
      },
      { timeout: 30000 },
    );

    return NextResponse.json({ drawResult });
  } catch (error) {
    return handleApiError(error);
  }
}
