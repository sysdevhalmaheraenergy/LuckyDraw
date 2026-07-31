import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/api-auth";
import { handleApiError, ApiError } from "@/lib/api-utils";
import { updateUserSchema } from "@/lib/schemas";

type Context = { params: Promise<{ userId: string }> };

export async function PATCH(request: NextRequest, ctx: Context) {
  try {
    const sessionUser = await requireSuperAdmin();
    const { userId } = await ctx.params;
    const body = updateUserSchema.parse(await request.json());

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      throw new ApiError("Pengguna tidak ditemukan.", 404);
    }

    if (body.role && body.role !== existing.role && userId === sessionUser.id) {
      throw new ApiError("Role diri sendiri tidak bisa diubah.", 400);
    }

    const data: {
      name?: string;
      email?: string;
      role?: "ADMIN" | "SUPERADMIN" | "STAFF";
      password?: string;
    } = {};

    if (body.name) data.name = body.name;
    if (body.email) data.email = body.email;
    if (body.role) data.role = body.role;
    if (body.password) data.password = await bcrypt.hash(body.password, 10);

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
