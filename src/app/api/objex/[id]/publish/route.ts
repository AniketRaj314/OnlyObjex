import { NextResponse } from "next/server";
import { getObjexById, setObjexPublishedState } from "@/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const existing = await getObjexById(id);

    if (!existing) {
      return NextResponse.json({ error: "Objex not found." }, { status: 404 });
    }

    const body = (await request.json()) as { isPublished?: boolean };
    const isPublished = Boolean(body.isPublished);
    const updated = await setObjexPublishedState(id, isPublished);

    return NextResponse.json({
      id,
      isPublished: updated?.isPublished ?? isPublished,
      publishedAt: updated?.publishedAt ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not update publish state.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
