import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { handleApiError, ApiError } from "@/lib/api-utils";
import { bucket } from "@/lib/firebase-admin";
import { finalizeUploadSchema } from "@/lib/schemas";

const UPLOAD_PREFIX = "lucky-draw/prizes/";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = finalizeUploadSchema.parse(await request.json());

    if (!body.path.startsWith(`${UPLOAD_PREFIX}${user.id}/`)) {
      throw new ApiError("Path upload tidak valid.", 400);
    }

    const file = bucket.file(body.path);
    const [exists] = await file.exists();
    if (!exists) {
      throw new ApiError("File belum selesai diupload.", 400);
    }

    await file.makePublic();

    return NextResponse.json({ url: `https://storage.googleapis.com/${bucket.name}/${body.path}` });
  } catch (error) {
    return handleApiError(error);
  }
}
