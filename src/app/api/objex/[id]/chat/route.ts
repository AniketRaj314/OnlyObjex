import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  ensureObjexChatStarterMessage,
  getObjexById,
  listObjexChatMessages,
  saveObjexChatMessage,
} from "@/lib/db";
import { generateObjexChatReply, synthesizeObjexSpeech } from "@/lib/chat";
import { objexChatRequestSchema } from "@/lib/schemas/objex";
import { saveChatAudioLocally } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: RouteContext<"/api/objex/[id]/chat">,
) {
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

    const history = await listObjexChatMessages(objex.id);
    const assistantReply = await generateObjexChatReply({
      profile: objex.profile,
      history,
      userMessage: body.message,
    });

    let audioPublicUrl: string | null = null;

    try {
      const audioBytes = await synthesizeObjexSpeech({
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

    const userMessage = await saveObjexChatMessage({
      objexId: objex.id,
      role: "user",
      content: body.message,
    });

    const assistantMessage = await saveObjexChatMessage({
      objexId: objex.id,
      role: "assistant",
      content: assistantReply,
      audioPublicUrl,
    });

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
