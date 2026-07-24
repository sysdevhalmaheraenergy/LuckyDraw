import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-utils";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { status: { in: ["ONGOING", "COMPLETED"] } },
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        _count: { select: { coupons: true, prizes: true } },
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    return handleApiError(error);
  }
}