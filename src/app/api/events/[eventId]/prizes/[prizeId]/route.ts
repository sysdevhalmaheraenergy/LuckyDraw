import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireUser } from "@/lib/api-auth";
import { handleApiError, ApiError } from "@/lib/api-utils";
import { updatePrizeSchema } from "@/lib/schemas";
import { unlink } from "node:fs/promises";
import { join } from "node:path";

type Context = { params: Promise<{ eventId: string; prizeId: string }> };

export async function GET(_request: Request, ctx: Context) {
  try {
    await requireUser();
    const { eventId, prizeId } = await ctx.params;

    const prize = await prisma.prize.findFirst({
      where: { id: prizeId, eventId },
      include: {
        drawResults: {
          where: { status: "VALID" },
          include: { coupon: true },
        },
      },
    });
    if (!prize) {
      throw new ApiError("Hadiah tidak ditemukan.", 404);
    }

    return NextResponse.json({ prize });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, ctx: Context) {
  try {
    await requireAdmin();
    const { eventId, prizeId } = await ctx.params;
    const body = updatePrizeSchema.parse(await request.json());

    const existing = await prisma.prize.findFirst({ where: { id: prizeId, eventId } });
    if (!existing) {
      throw new ApiError("Hadiah tidak ditemukan.", 404);
    }

    const prize = await prisma.prize.update({
      where: { id: prizeId },
      data: {
        name: body.name,
        description: body.description,
        imageUrl: body.imageUrl,
        drawOrder: body.drawOrder,
      },
    });

    if (existing.imageUrl && body.imageUrl !== existing.imageUrl) {
      const oldImagePath = join(process.cwd(), "public", existing.imageUrl);
      try {
        await unlink(oldImagePath);
      } catch {
        // File might not exist
      }
    }

    return NextResponse.json({ prize });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, ctx: Context) {
  try {
    await requireAdmin();
    const { eventId, prizeId } = await ctx.params;

    const prize = await prisma.prize.findFirst({ where: { id: prizeId, eventId } });
    if (!prize) {
      throw new ApiError("Hadiah tidak ditemukan.", 404);
    }
    if (prize.status !== "PENDING") {
      throw new ApiError(
        "Hadiah yang sudah diundi tidak bisa dihapus, undo hasil undiannya dulu.",
        400
      );
    }

    if (prize.imageUrl) {
      const imagePath = join(process.cwd(), "public", prize.imageUrl);
      try {
        await unlink(imagePath);
      } catch {
        // File might not exist, continue with deletion
      }
    }

    await prisma.prize.delete({ where: { id: prizeId } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
