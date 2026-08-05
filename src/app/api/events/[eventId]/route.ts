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

    if (body.additionalCoupons !== undefined && existing.status !== "DRAFT") {
      throw new ApiError("Hanya event draft yang bisa menambah kupon.", 400);
    }

    if (body.removeCoupons !== undefined && existing.status !== "DRAFT") {
      throw new ApiError("Hanya event draft yang bisa menghapus kupon.", 400);
    }

    if (body.additionalCoupons !== undefined && body.removeCoupons !== undefined) {
      throw new ApiError("Tidak bisa menambah dan menghapus kupon sekaligus.", 400);
    }

    let newTotalCoupons: number | undefined;

    if (body.removeCoupons !== undefined) {
      const toRemove = await prisma.coupon.findMany({
        where: { eventId, status: { not: "WON" } },
        orderBy: { number: "desc" },
        take: body.removeCoupons,
        select: { id: true, number: true },
      });

      const actualCount = toRemove.length;
      if (actualCount < body.removeCoupons) {
        throw new ApiError(
          `Hanya ada ${actualCount} kupon yang bisa dihapus, tetapi diminta ${body.removeCoupons}.`,
          400,
        );
      }

      const newTotal = existing.totalCoupons - actualCount;

      await prisma.$transaction([
        prisma.coupon.deleteMany({
          where: { id: { in: toRemove.map((c) => c.id) } },
        }),
        prisma.event.update({
          where: { id: eventId },
          data: { totalCoupons: newTotal },
        }),
      ]);

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      return NextResponse.json({ event });
    }

    if (body.additionalCoupons !== undefined) {
      newTotalCoupons = existing.totalCoupons + body.additionalCoupons;

      const maxCoupon = await prisma.coupon.findFirst({
        where: { eventId },
        orderBy: { number: "desc" },
        select: { number: true },
      });

      const startNumber = (maxCoupon?.number ?? 0) + 1;
      const batchSize = 100;

      const couponData = Array.from(
        { length: body.additionalCoupons },
        (_, j) => ({ eventId, number: startNumber + j }),
      );

      await prisma.$transaction(async (tx) => {
        for (let i = 0; i < couponData.length; i += batchSize) {
          await tx.coupon.createMany({
            data: couponData.slice(i, i + batchSize),
          });
        }

        await tx.event.update({
          where: { id: eventId },
          data: {
            name: body.name,
            description: body.description,
            status: body.status,
            totalCoupons: newTotalCoupons,
          },
        });
      });

      const event = await prisma.event.findUnique({ where: { id: eventId } });
      return NextResponse.json({ event });
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
