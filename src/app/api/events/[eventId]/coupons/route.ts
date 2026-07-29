import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { handleApiError, ApiError } from "@/lib/api-utils";
import { couponStatusSchema } from "@/lib/schemas";

type Context = { params: Promise<{ eventId: string }> };

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 50;

export async function GET(request: Request, ctx: Context) {
  try {
    await requireUser();
    const { eventId } = await ctx.params;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new ApiError("Event tidak ditemukan.", 404);
    }

    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status");
    const statusResult = statusParam ? couponStatusSchema.safeParse(statusParam) : undefined;
    if (statusParam && !statusResult?.success) {
      throw new ApiError("Status kupon tidak valid.", 400);
    }

    const page = Math.max(1, Number(url.searchParams.get("page")) || DEFAULT_PAGE);
    let limit = Math.max(1, Number(url.searchParams.get("limit")) || DEFAULT_LIMIT);
    if (!PAGE_SIZE_OPTIONS.includes(limit as (typeof PAGE_SIZE_OPTIONS)[number])) {
      limit = DEFAULT_LIMIT;
    }
    limit = Math.min(limit, MAX_LIMIT);

    const where = { eventId, status: statusResult?.data };

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { number: "asc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      coupons,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
