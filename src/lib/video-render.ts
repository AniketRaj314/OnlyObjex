import type { Videos } from "openai/resources/videos";
import { env } from "@/lib/env";
import { getOpenAIClient } from "@/lib/openai";
import { getSavedSceneVideoPublicUrl, saveSceneVideoLocally } from "@/lib/storage";
import { sceneRenderJobSchema } from "@/lib/schemas/objex";

type OpenAIVideo = Videos.Video;

function mapVideoJob(job: OpenAIVideo, videoPublicUrl: string | null) {
  return sceneRenderJobSchema.parse({
    id: job.id,
    status: job.status,
    progress: job.progress,
    model: job.model,
    seconds: String(job.seconds),
    size: job.size,
    createdAt: job.created_at,
    completedAt: job.completed_at,
    expiresAt: job.expires_at,
    error: job.error
      ? {
          code: job.error.code,
          message: job.error.message,
        }
      : null,
    videoPublicUrl,
  });
}

export async function createSceneRenderJob(finalSoraPrompt: string) {
  const client = getOpenAIClient();
  const job = await client.videos.create({
    model: env.openAiVideoModel,
    prompt: finalSoraPrompt,
    seconds: "12",
    size: "1280x720",
  });

  return mapVideoJob(job, null);
}

export async function getSceneRenderJob(videoId: string) {
  const client = getOpenAIClient();
  const job = await client.videos.retrieve(videoId);
  let videoPublicUrl = await getSavedSceneVideoPublicUrl(videoId);

  if (job.status === "completed" && !videoPublicUrl) {
    const content = await client.videos.downloadContent(videoId, {
      variant: "video",
    });
    const bytes = Buffer.from(await content.arrayBuffer());
    const saved = await saveSceneVideoLocally(videoId, bytes);
    videoPublicUrl = saved.videoPublicUrl;
  }

  return mapVideoJob(job, videoPublicUrl);
}
