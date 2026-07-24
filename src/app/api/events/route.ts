import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-utils";
import { createEventSchema } from "@/lib/schemas";

export async function GET() {
  try {
    await requireUser();
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { coupons: true, prizes: true } } },
    });
    return NextResponse.json({ events });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = createEventSchema.parse(await request.json());

    const event = await prisma.event.create({
      data: {
        name: body.name,
        description: body.description,
        totalCoupons: body.totalCoupons,
        userId: user.id,
      },
    });

    try {
      const batchSize = 100;
      for (let i = 0; i < body.totalCoupons; i += batchSize) {
        const batch = Array.from(
          { length: Math.min(batchSize, body.totalCoupons - i) },
          (_, j) => ({ eventId: event.id, number: i + j + 1 })
        );
        await prisma.coupon.createMany({ data: batch });
      }
    } catch (couponError) {
      await prisma.event.delete({ where: { id: event.id } });
      throw couponError;
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
