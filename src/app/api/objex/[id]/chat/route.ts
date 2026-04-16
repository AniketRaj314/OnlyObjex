import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  ensureObjexChatStarterMessage,
  getObjexChatMemorySummary,
  getObjexById,
  listObjexChatMessages,
  saveObjexChatMemorySummary,
  saveObjexChatMessage,
} from "@/lib/db";
import {
  generateObjexChatReply,
  summarizeObjexChatMemory,
  synthesizeObjexSpeech,
} from "@/lib/chat";
import { objexChatRequestSchema } from "@/lib/schemas/objex";
import { saveChatAudioLocally } from "@/lib/storage";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const objex = await getObjexById(id);

    if (!objex) {
      return NextResponse.json({ error: "Objex not found." }, { status: 404 });
    }

    const body = objexChatRequestSchema.parse(await request.json());
    await ensureObjexChatStarterMessage({
      objexId: objex.id,
      openingMessage: objex.profile.openingMessage,
    });

    const userMessage = await saveObjexChatMessage({
      objexId: objex.id,
      role: "user",
      content: body.message,
    });

    const memorySummary = await getObjexChatMemorySummary(objex.id);
    const history = await listObjexChatMessages(objex.id);
    const assistantReply = await generateObjexChatReply({
      profile: objex.profile,
      history,
      memorySummary,
      userMessage: body.message,
    });

    let audioPublicUrl: string | null = null;

    try {
      const audioBytes = await synthesizeObjexSpeech({
        objexId: objex.id,
        profile: objex.profile,
        text: assistantReply,
      });

      if (audioBytes) {
        const audio = await saveChatAudioLocally(
          `${objex.id}-${randomUUID()}`,
          audioBytes,
        );
        audioPublicUrl = audio.audioPublicUrl;
      }
    } catch (error) {
      console.error("Objex TTS failed", error);
    }

    const assistantMessage = await saveObjexChatMessage({
      objexId: objex.id,
      role: "assistant",
      content: assistantReply,
      audioPublicUrl,
    });

    try {
      const nextSummary = await summarizeObjexChatMemory({
        profile: objex.profile,
        previousSummary: memorySummary,
        history: [...history, assistantMessage],
      });

      if (nextSummary) {
        await saveObjexChatMemorySummary({
          objexId: objex.id,
          summary: nextSummary,
        });
      }
    } catch (error) {
      console.error("Objex chat memory update failed", error);
    }

    return NextResponse.json({
      messages: [userMessage, assistantMessage],
    });
  } catch (error) {
    console.error("Objex chat failed", error);

    const message =
      error instanceof Error
        ? error.message
        : "Something dramatic happened during chat.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
