import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { handleApiError } from "@/lib/api-utils";
import { bucket } from "@/lib/firebase-admin";
import { presignUploadSchema } from "@/lib/schemas";

const UPLOAD_PREFIX = "lucky-draw/prizes";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const body = presignUploadSchema.parse(await request.json());

    const safeFileName = body.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${UPLOAD_PREFIX}/${user.id}/${Date.now()}-${safeFileName}`;

    const [uploadUrl] = await bucket.file(path).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 5 * 60 * 1000,
      contentType: body.contentType,
    });

    return NextResponse.json({ uploadUrl, path });
  } catch (error) {
    return handleApiError(error);
  }
}
