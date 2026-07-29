import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { handleApiError, ApiError } from "@/lib/api-utils";
import { bucket } from "@/lib/firebase-admin";

const MAX_FILE_SIZE = 500_000;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

type UploadType = "prizes" | "events" | "coupons" | "draw-results";

export async function POST(request: NextRequest, ctx: { params: Promise<{ type: string }> }) {
  try {
    const user = await requireAdmin();

    const { type } = await ctx.params;
    if (!isValidUploadType(type)) {
      throw new ApiError("Tipe unggah tidak valid.", 400);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new ApiError("File tidak ditemukan.", 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError(
        `Ukuran file melebihi batas maksimum 500 KB.`,
        400
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      throw new ApiError(
        "Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.",
        400
      );
    }

    const ext = getFileExtension(file.name);
    if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
      throw new ApiError(
        "Ekstensi file tidak didukung. Gunakan .jpg, .jpeg, atau .png.",
        400
      );
    }

    const uploadPrefix = `lucky-draw/${type}`;
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${uploadPrefix}/${user.id}/${Date.now()}-${safeFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileRef = bucket.file(path);
    await fileRef.save(Buffer.from(arrayBuffer), {
      metadata: { contentType: file.type },
    });
    await fileRef.makePublic();

    const url = `https://storage.googleapis.com/${bucket.name}/${path}`;

    return NextResponse.json({ dataUrl: url }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

function isValidUploadType(type: string): type is UploadType {
  return ["prizes", "events", "coupons", "draw-results"].includes(type);
}

function getFileExtension(filename: string): string | null {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1 || dotIndex === 0) return null;
  return filename.slice(dotIndex).toLowerCase();
}
