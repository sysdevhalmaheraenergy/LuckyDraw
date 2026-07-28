import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { handleApiError, ApiError } from "@/lib/api-utils";

type Context = { params: Promise<{ resultId: string }> };

export async function POST(_request: Request, ctx: Context) {
  try {
    await requireAdmin();
    const { resultId } = await ctx.params;

    const updated = await prisma.$transaction(async (tx) => {
      const drawResult = await tx.drawResult.findUnique({ where: { id: resultId } });
      if (!drawResult) {
        throw new ApiError("Hasil undian tidak ditemukan.", 404);
      }
      if (drawResult.status === "UNDONE") {
        throw new ApiError("Hasil undian ini sudah dibatalkan sebelumnya.", 400);
      }

      await tx.coupon.update({
        where: { id: drawResult.couponId },
        data: { status: "AVAILABLE" },
      });
      await tx.prize.update({
        where: { id: drawResult.prizeId },
        data: { status: "PENDING" },
      });

      return tx.drawResult.update({
        where: { id: resultId },
        data: { status: "UNDONE", undoneAt: new Date() },
      });
    }, { timeout: 30000 });

    return NextResponse.json({ drawResult: updated });
  } catch (error) {
    return handleApiError(error);
  }
}
