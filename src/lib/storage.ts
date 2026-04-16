import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
const uploadsDir = path.join(process.cwd(), "public", "uploads");
const chatAudioDir = path.join(process.cwd(), "public", "chat-audio");

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

export async function saveImageLocally(
  id: string,
  bytes: Buffer,
  mimeType: string,
) {
  await mkdir(uploadsDir, { recursive: true });
  const extension = extensionForMimeType(mimeType);
  const fileName = `${id}.${extension}`;
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
  await mkdir(chatAudioDir, { recursive: true });
  const fileName = `${id}.mp3`;
  const relativePath = `/chat-audio/${fileName}`;
  const absolutePath = path.join(chatAudioDir, fileName);

  await writeFile(absolutePath, bytes);

  return {
    audioPath: absolutePath,
    audioPublicUrl: relativePath,
  };
}
