import { NextResponse } from "next/server";
import { getObjexById } from "@/lib/db";
import { generateScenePlan } from "@/lib/scenes";
import {
  sceneGenerationRequestSchema,
  scenePlannerResponseSchema,
} from "@/lib/schemas/objex";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = sceneGenerationRequestSchema.parse(await request.json());

    if (
      body.secondaryObjexId &&
      body.secondaryObjexId === body.primaryObjexId
    ) {
      return NextResponse.json(
        { error: "Pick a different secondary Objex or leave it empty." },
        { status: 400 },
      );
    }

    const [primary, secondary] = await Promise.all([
      getObjexById(body.primaryObjexId),
      body.secondaryObjexId ? getObjexById(body.secondaryObjexId) : null,
    ]);

    if (!primary) {
      return NextResponse.json(
        { error: "Primary Objex not found." },
        { status: 404 },
      );
    }

    if (!primary.isPublished) {
      return NextResponse.json(
        { error: "Primary Objex must be published before it can star in a scene." },
        { status: 400 },
      );
    }

    if (body.secondaryObjexId && !secondary) {
      return NextResponse.json(
        { error: "Secondary Objex not found." },
        { status: 404 },
      );
    }

    if (secondary && !secondary.isPublished) {
      return NextResponse.json(
        { error: "Secondary Objex must be published before it can star in a scene." },
        { status: 400 },
      );
    }

    const result = await generateScenePlan({
      primary,
      secondary,
      scenarioPreset: body.scenarioPreset,
      customScenarioNote: body.customScenarioNote?.trim() ?? "",
      moodModifier: body.moodModifier ?? "",
    });

    return NextResponse.json(scenePlannerResponseSchema.parse(result));
  } catch (error) {
    console.error("Scene generation failed", error);

    const message =
      error instanceof Error
        ? error.message
        : "Something dramatic happened during scene generation.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
