import { NextResponse } from "next/server";
import { buildObjexProfile } from "@/lib/generation";
import { saveObjex } from "@/lib/db";
import { saveImageLocally } from "@/lib/storage";

export const runtime = "nodejs";

const supportedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a real object photo." },
        { status: 400 },
      );
    }

    if (!supportedMimeTypes.has(image.type)) {
      return NextResponse.json(
        { error: "Upload a JPG, PNG, WEBP, or HEIC image." },
        { status: 400 },
      );
    }

    if (image.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Keep image uploads under 8MB for the first build." },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await image.arrayBuffer());
    const generated = await buildObjexProfile({
      bytes,
      mimeType: image.type,
      fileName: image.name,
    });

    const storageResult = await saveImageLocally(generated.id, bytes, image.type);
    const createdAt = new Date().toISOString();

    await saveObjex({
      id: generated.id,
      imagePath: storageResult.imagePath,
      imagePublicUrl: storageResult.imagePublicUrl,
      createdAt,
      profile: generated.profile,
    });

    return NextResponse.json({
      id: generated.id,
      imageUrl: storageResult.imageRelativeUrl,
    });
  } catch (error) {
    console.error("Objex generation failed", error);

    const message =
      error instanceof Error
        ? error.message
        : "Something dramatic happened during Objex generation.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
