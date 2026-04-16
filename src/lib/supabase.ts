import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

const uploadBucket = "uploads";
const chatAudioBucket = "chat-audio";
const sceneVideoBucket = "scene-videos";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminClient: any;

export function hasSupabase() {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export function getSupabaseAdminClient() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  if (!adminClient) {
    adminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClient;
}

export const supabaseBuckets = {
  uploadBucket,
  chatAudioBucket,
  sceneVideoBucket,
} as const;

export function getSupabasePublicUrl(bucket: string, path: string) {
  const client = getSupabaseAdminClient();
  const { data } = client.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}
