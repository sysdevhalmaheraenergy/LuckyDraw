import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_FILES: Record<string, string> = {
  "swagger-ui.css": "text/css",
  "swagger-ui-bundle.js": "application/javascript",
  "swagger-ui-standalone-preset.js": "application/javascript",
};

const ASSET_DIR = path.join(process.cwd(), "node_modules", "swagger-ui-dist");

type Context = { params: Promise<{ file: string }> };

export async function GET(_request: Request, ctx: Context) {
  const { file } = await ctx.params;
  const contentType = ALLOWED_FILES[file];
  if (!contentType) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contents = await readFile(path.join(ASSET_DIR, file));
  return new NextResponse(contents, { headers: { "Content-Type": contentType } });
}
