import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdminClient, getSupabasePublicUrl, hasSupabase, supabaseBuckets } from "@/lib/supabase";

const uploadsDir = path.join(process.cwd(), "public", "uploads");
const chatAudioDir = path.join(process.cwd(), "public", "chat-audio");
const sceneVideoDir = path.join(process.cwd(), "public", "scene-videos");

function extensionForMimeType(mimeType: string) {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
    case "image/heif":
      return "heic";
    default:
      return "jpg";
  }
}

async function uploadToSupabase(params: {
  bucket: string;
  objectPath: string;
  bytes: Buffer;
  contentType: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.storage
    .from(params.bucket)
    .upload(params.objectPath, params.bytes, {
      contentType: params.contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload to Supabase Storage: ${error.message}`);
  }

  return getSupabasePublicUrl(params.bucket, params.objectPath);
}

export async function saveImageLocally(
  id: string,
  bytes: Buffer,
  mimeType: string,
) {
  const extension = extensionForMimeType(mimeType);
  const fileName = `${id}.${extension}`;

  if (hasSupabase()) {
    const objectPath = `objex/${fileName}`;
    const publicUrl = await uploadToSupabase({
      bucket: supabaseBuckets.uploadBucket,
      objectPath,
      bytes,
      contentType: mimeType,
    });

    return {
      imagePath: objectPath,
      imagePublicUrl: publicUrl,
      imageRelativeUrl: publicUrl,
    };
  }

  await mkdir(uploadsDir, { recursive: true });
  const relativePath = `/uploads/${fileName}`;
  const absolutePath = path.join(uploadsDir, fileName);

  await writeFile(absolutePath, bytes);

  return {
    imagePath: absolutePath,
    imagePublicUrl: relativePath,
    imageRelativeUrl: relativePath,
  };
}

export async function saveChatAudioLocally(id: string, bytes: Buffer) {
  const fileName = `${id}.mp3`;

  if (hasSupabase()) {
    const objectPath = `chat/${fileName}`;
    const publicUrl = await uploadToSupabase({
      bucket: supabaseBuckets.chatAudioBucket,
      objectPath,
      bytes,
      contentType: "audio/mpeg",
    });

    return {
      audioPath: objectPath,
      audioPublicUrl: publicUrl,
    };
  }

  await mkdir(chatAudioDir, { recursive: true });
  const relativePath = `/chat-audio/${fileName}`;
  const absolutePath = path.join(chatAudioDir, fileName);

  await writeFile(absolutePath, bytes);

  return {
    audioPath: absolutePath,
    audioPublicUrl: relativePath,
  };
}

export async function getSavedSceneVideoPublicUrl(id: string) {
  const fileName = `${id}.mp4`;

  if (hasSupabase()) {
    const objectPath = `renders/${fileName}`;
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from(supabaseBuckets.sceneVideoBucket)
      .download(objectPath);

    if (error || !data) {
      return null;
    }

    return getSupabasePublicUrl(supabaseBuckets.sceneVideoBucket, objectPath);
  }

  const absolutePath = path.join(sceneVideoDir, fileName);

  try {
    await access(absolutePath);

    return `/scene-videos/${fileName}`;
  } catch {
    return null;
  }
}

export async function saveSceneVideoLocally(id: string, bytes: Buffer) {
  const fileName = `${id}.mp4`;

  if (hasSupabase()) {
    const objectPath = `renders/${fileName}`;
    const publicUrl = await uploadToSupabase({
      bucket: supabaseBuckets.sceneVideoBucket,
      objectPath,
      bytes,
      contentType: "video/mp4",
    });

    return {
      videoPath: objectPath,
      videoPublicUrl: publicUrl,
    };
  }

  await mkdir(sceneVideoDir, { recursive: true });
  const relativePath = `/scene-videos/${fileName}`;
  const absolutePath = path.join(sceneVideoDir, fileName);

  await writeFile(absolutePath, bytes);

  return {
    videoPath: absolutePath,
    videoPublicUrl: relativePath,
  };
}
