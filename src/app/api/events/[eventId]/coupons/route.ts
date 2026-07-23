import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { handleApiError, ApiError } from "@/lib/api-utils";
import { couponStatusSchema } from "@/lib/schemas";

type Context = { params: Promise<{ eventId: string }> };

export async function GET(request: Request, ctx: Context) {
  try {
    await requireUser();
    const { eventId } = await ctx.params;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new ApiError("Event tidak ditemukan.", 404);
    }

    const statusParam = new URL(request.url).searchParams.get("status");
    const statusResult = statusParam ? couponStatusSchema.safeParse(statusParam) : undefined;
    if (statusParam && !statusResult?.success) {
      throw new ApiError("Status kupon tidak valid.", 400);
    }

    const coupons = await prisma.coupon.findMany({
      where: { eventId, status: statusResult?.data },
      orderBy: { number: "asc" },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    return handleApiError(error);
  }
}
