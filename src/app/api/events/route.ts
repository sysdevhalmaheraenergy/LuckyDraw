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

    const event = await prisma.$transaction(async (tx) => {
      const created = await tx.event.create({
        data: {
          name: body.name,
          description: body.description,
          totalCoupons: body.totalCoupons,
          userId: user.id,
        },
      });

      await tx.coupon.createMany({
        data: Array.from({ length: body.totalCoupons }, (_, i) => ({
          eventId: created.id,
          number: i + 1,
        })),
      });

      return created;
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
