import { NextResponse } from "next/server";
import { getSceneRenderJob } from "@/lib/video-render";
import { sceneRenderJobSchema } from "@/lib/schemas/objex";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const job = await getSceneRenderJob(id);

    return NextResponse.json(sceneRenderJobSchema.parse(job));
  } catch (error) {
    console.error("Scene render status failed", error);

    const message =
      error instanceof Error
        ? error.message
        : "Something dramatic happened while checking the video render.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
