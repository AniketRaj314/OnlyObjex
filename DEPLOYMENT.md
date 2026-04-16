# Judges Demo Deployment

OnlyObjex can run in two modes:

- local mode: SQLite + local filesystem storage
- hosted mode: Supabase Postgres + Supabase Storage

For Vercel, use hosted mode.

## 1. Secret hygiene

- Rotate `OPENAI_API_KEY` before deployment if a real key was ever stored locally or shared.
- Keep `.env.local` local only.
- Store deployment secrets in Vercel project settings.

## 2. Supabase setup

1. Create a new Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Verify these public buckets exist:
   - `uploads`
   - `chat-audio`
   - `scene-videos`
4. Copy:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 3. Vercel env vars

Set these in Vercel:

- `OPENAI_API_KEY`
- `OPENAI_PROFILE_MODEL=gpt-5.4`
- `OPENAI_SCENE_MODEL=gpt-5.4`
- `OPENAI_VIDEO_MODEL=sora-2`
- `OPENAI_VISION_MODEL=gpt-4.1-mini`
- `OPENAI_TTS_MODELS=gpt-4o-mini-tts,tts-1-hd`
- `OPENAI_TTS_VOICES=coral,nova,shimmer,marin`
- `NEXT_PUBLIC_APP_URL=<your deployed Vercel URL>`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 4. Deploy

1. Import the repo into Vercel.
2. Confirm the framework is Next.js.
3. Add the environment variables above.
4. Deploy.

When `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present, the app will automatically use hosted persistence and hosted file storage.

## 5. Judges smoke test

Run through this on the deployed URL:

1. Create an Objex from a real object photo.
2. Open the reveal page.
3. Publish it.
4. Confirm it appears in `/community`.
5. Send a chat message and verify TTS audio plays.
6. Generate a chemistry conversation.
7. Generate a scene plan.
8. Confirm a video render.
9. Wait for the completed video and play it.

## 6. Notes

- The current OpenAI video API supports short teaser renders only, so scene rendering is intentionally optimized for a short clip.
- Public URLs are used for uploaded images, audio, and scene videos so judges can load assets directly from storage.
- Local SQLite and local file storage remain available for development if Supabase env vars are not set.
