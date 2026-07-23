import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/api-auth";
import { handleApiError, ApiError } from "@/lib/api-utils";
import { createPrizeSchema } from "@/lib/schemas";

type Context = { params: Promise<{ eventId: string }> };

export async function GET(_request: Request, ctx: Context) {
  try {
    await requireUser();
    const { eventId } = await ctx.params;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new ApiError("Event tidak ditemukan.", 404);
    }

    const prizes = await prisma.prize.findMany({
      where: { eventId },
      orderBy: { drawOrder: "asc" },
      include: {
        drawResults: {
          where: { status: "VALID" },
          include: { coupon: true },
        },
      },
    });

    return NextResponse.json({ prizes });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest, ctx: Context) {
  try {
    await requireAdmin();
    const { eventId } = await ctx.params;
    const body = createPrizeSchema.parse(await request.json());

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new ApiError("Event tidak ditemukan.", 404);
    }

    const prize = await prisma.prize.create({
      data: {
        eventId,
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl,
        drawOrder: body.drawOrder,
      },
    });

    return NextResponse.json({ prize }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
