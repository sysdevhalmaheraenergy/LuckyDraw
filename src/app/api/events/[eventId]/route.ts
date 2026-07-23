import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/api-auth";
import { handleApiError, ApiError } from "@/lib/api-utils";
import { updateEventSchema } from "@/lib/schemas";

type Context = { params: Promise<{ eventId: string }> };

export async function GET(_request: Request, ctx: Context) {
  try {
    await requireUser();
    const { eventId } = await ctx.params;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        prizes: {
          orderBy: { drawOrder: "asc" },
          include: {
            drawResults: {
              where: { status: "VALID" },
              include: { coupon: true },
            },
          },
        },
        coupons: { orderBy: { number: "asc" } },
      },
    });

    if (!event) {
      throw new ApiError("Event tidak ditemukan.", 404);
    }

    return NextResponse.json({ event });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, ctx: Context) {
  try {
    await requireAdmin();
    const { eventId } = await ctx.params;
    const body = updateEventSchema.parse(await request.json());

    const existing = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existing) {
      throw new ApiError("Event tidak ditemukan.", 404);
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        name: body.name,
        description: body.description,
        status: body.status,
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, ctx: Context) {
  try {
    await requireAdmin();
    const { eventId } = await ctx.params;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      throw new ApiError("Event tidak ditemukan.", 404);
    }
    if (event.status !== "DRAFT") {
      throw new ApiError("Event yang sudah berjalan tidak bisa dihapus.", 400);
    }

    await prisma.$transaction([
      prisma.drawResult.deleteMany({ where: { prize: { eventId } } }),
      prisma.prize.deleteMany({ where: { eventId } }),
      prisma.coupon.deleteMany({ where: { eventId } }),
      prisma.event.delete({ where: { id: eventId } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
