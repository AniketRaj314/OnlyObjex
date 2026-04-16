import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  attachChemistryTurnAudio,
  buildChemistryConversationDraft,
  generateObjexChemistryScene,
  getObjexProfileForParticipant,
} from "@/lib/chemistry";
import { getObjexById } from "@/lib/db";
import {
  chemistryConversationRequestSchema,
  chemistryConversationResponseSchema,
} from "@/lib/schemas/objex";
import { synthesizeObjexSpeech } from "@/lib/chat";
import { saveChatAudioLocally } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = chemistryConversationRequestSchema.parse(await request.json());

    if (body.leftObjexId === body.rightObjexId) {
      return NextResponse.json(
        { error: "Choose two different Objex for chemistry." },
        { status: 400 },
      );
    }

    const [left, right] = await Promise.all([
      getObjexById(body.leftObjexId),
      getObjexById(body.rightObjexId),
    ]);

    if (!left || !right) {
      return NextResponse.json(
        { error: "One of those Objex could not be found." },
        { status: 404 },
      );
    }

    if (!left.isPublished || !right.isPublished) {
      return NextResponse.json(
        { error: "Only published Objex can join the chemistry page." },
        { status: 400 },
      );
    }

    const scene = await generateObjexChemistryScene({ left, right });
    const draft = buildChemistryConversationDraft({ left, right, scene });
    const participantPair: [typeof left, typeof right] = [left, right];
    const audioByTurnId = new Map<string, string | null>();

    for (const turn of draft.turns) {
      try {
        const audioBytes = await synthesizeObjexSpeech({
          objexId: turn.speakerObjexId,
          profile: getObjexProfileForParticipant(
            turn.speakerObjexId,
            participantPair,
          ),
          text: turn.text,
        });

        if (!audioBytes) {
          audioByTurnId.set(turn.id, null);
          continue;
        }

        const audio = await saveChatAudioLocally(
          `chemistry-${turn.speakerObjexId}-${randomUUID()}`,
          audioBytes,
        );
        audioByTurnId.set(turn.id, audio.audioPublicUrl);
      } catch (error) {
        console.error("Chemistry TTS failed", error);
        audioByTurnId.set(turn.id, null);
      }
    }

    const payload = attachChemistryTurnAudio({
      response: draft,
      audioByTurnId,
    });

    return NextResponse.json(
      chemistryConversationResponseSchema.parse(payload),
    );
  } catch (error) {
    console.error("Chemistry generation failed", error);

    const message =
      error instanceof Error
        ? error.message
        : "Something dramatic happened during chemistry generation.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
