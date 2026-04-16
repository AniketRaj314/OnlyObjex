import { NextResponse } from "next/server";
import { createSceneRenderJob } from "@/lib/video-render";
import { sceneRenderJobSchema, sceneRenderRequestSchema } from "@/lib/schemas/objex";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = sceneRenderRequestSchema.parse(await request.json());
    const job = await createSceneRenderJob(body.finalSoraPrompt);

    return NextResponse.json(sceneRenderJobSchema.parse(job));
  } catch (error) {
    console.error("Scene render start failed", error);

    const message =
      error instanceof Error
        ? error.message
        : "Something dramatic happened while starting the video render.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
