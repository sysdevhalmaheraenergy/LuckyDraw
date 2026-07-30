import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { handleApiError, ApiError } from "@/lib/api-utils";
import { updateDrawResultNoteSchema } from "@/lib/schemas";
import { getBucket } from "@/lib/firebase-admin";

type Context = { params: Promise<{ resultId: string }> };

const MAX_FILE_SIZE = 500_000;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);
const MAX_IMAGE_URL_LENGTH = 2048;

export async function PATCH(request: NextRequest, ctx: Context) {
  try {
    await requireAdmin();
    const { resultId } = await ctx.params;

    const body = updateDrawResultNoteSchema.parse(await request.json());
    const { note, imageUrl } = body;

    if (imageUrl !== undefined && imageUrl.length > MAX_IMAGE_URL_LENGTH) {
      throw new ApiError("URL gambar terlalu panjang.", 400);
    }

    const drawResult = await prisma.drawResult.findUnique({
      where: { id: resultId },
    });

    if (!drawResult) {
      throw new ApiError("Hasil undian tidak ditemukan.", 404);
    }

    if (drawResult.status === "UNDONE") {
      throw new ApiError("Hasil undian ini sudah dibatalkan.", 400);
    }

    const updated = await prisma.drawResult.update({
      where: { id: resultId },
      data: {
        note: note !== undefined ? note : (drawResult.note ?? undefined),
        imageUrl: imageUrl !== undefined ? imageUrl : (drawResult.imageUrl ?? undefined),
      },
    });

    return NextResponse.json({ drawResult: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest, ctx: Context) {
  try {
    const user = await requireAdmin();
    const { resultId } = await ctx.params;

    const formData = await request.formData();
    const note = formData.get("note")?.toString();
    const file = formData.get("file") as File | null;

    let imageUrl: string | undefined;

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        throw new ApiError("Ukuran file melebihi batas maksimum 500 KB.", 400);
      }

      if (!ALLOWED_TYPES.has(file.type)) {
        throw new ApiError("Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.", 400);
      }

      const ext = getFileExtension(file.name);
      if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
        throw new ApiError("Ekstensi file tidak didukung. Gunakan .jpg, .jpeg, atau .png.", 400);
      }

      const uploadPrefix = "lucky-draw/draw-results";
      const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${uploadPrefix}/${user.id}/${Date.now()}-${safeFileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const bucket = getBucket();
      const fileRef = bucket.file(path);
      await fileRef.save(Buffer.from(arrayBuffer), {
        metadata: { contentType: file.type },
      });
      await fileRef.makePublic();

      imageUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;
    }

    const body = {
      note: note || undefined,
      imageUrl,
    };

    const validated = updateDrawResultNoteSchema.parse(body);

    if (validated.imageUrl !== undefined && validated.imageUrl.length > MAX_IMAGE_URL_LENGTH) {
      throw new ApiError("URL gambar terlalu panjang.", 400);
    }

    const drawResult = await prisma.drawResult.findUnique({
      where: { id: resultId },
    });

    if (!drawResult) {
      throw new ApiError("Hasil undian tidak ditemukan.", 404);
    }

    if (drawResult.status === "UNDONE") {
      throw new ApiError("Hasil undian ini sudah dibatalkan.", 400);
    }

    const updated = await prisma.drawResult.update({
      where: { id: resultId },
      data: {
        note: validated.note !== undefined ? validated.note : (drawResult.note ?? undefined),
        imageUrl: validated.imageUrl !== undefined ? validated.imageUrl : (drawResult.imageUrl ?? undefined),
      },
    });

    return NextResponse.json({ drawResult: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

function getFileExtension(filename: string): string | null {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1 || dotIndex === 0) return null;
  return filename.slice(dotIndex).toLowerCase();
}