# OnlyObjex

OnlyObjex turns a real photo of an everyday object into a polished, creator-style parody profile with a sexy, witty, innuendo-heavy voice that stays demo-safe.

## First build scope

- `/` landing page
- `/create` upload and generation flow
- `/objex/[id]` reveal page
- `/community` published Objex listing
- image upload to local storage
- saved Objex records in a local SQLite database
- local publish/unpublish state in SQLite
- two-step AI pipeline:
  - object extraction from the image
  - strict JSON profile generation

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- OpenAI Responses API
- Zod validation
- local SQLite + local file storage for milestone one

The app is structured so Supabase/Postgres can replace the local repository later without rewriting the UI flow.

## Environment

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

Required for real generation:

- `OPENAI_API_KEY`

Optional:

- `OPENAI_PROFILE_MODEL` defaults to `gpt-5.4`
- `OPENAI_SCENE_MODEL` defaults to `gpt-5.4`
- `OPENAI_VIDEO_MODEL` defaults to `sora-2`
- `OPENAI_VISION_MODEL` defaults to `gpt-4.1-mini`
- `OPENAI_TTS_MODELS` defaults to `gpt-4o-mini-tts,tts-1-hd`
- `OPENAI_TTS_VOICES` defaults to `coral,nova,shimmer,marin`
- `NEXT_PUBLIC_APP_URL` defaults to `http://localhost:3000`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` enable hosted Postgres + Storage for deployment
- `ALLOW_MOCK_GENERATION=true` enables a local fallback profile generator when no API key is present

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Generated images are stored in `public/uploads/` and Objex records are stored in `data/onlyobjex.db`.

If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present, the app switches to hosted Postgres + Supabase Storage automatically instead of local SQLite/filesystem storage. This is the intended path for Vercel deployment.

## Local publish and community

- Publish or unpublish from the Objex reveal page
- Published profiles appear on `/community`
- Publish state is stored locally in SQLite with `is_published` and `published_at`
- Existing local databases are upgraded automatically on startup; no manual migration is required

## Camera capture

- The create flow supports both `Take photo` and `Choose from library`
- On supported mobile browsers, `Take photo` uses the browser's native file input capture behavior with `capture="environment"` to prompt direct camera capture

## Supabase follow-up

For deployment, use the schema in `supabase/schema.sql`, then create three public storage buckets in Supabase Storage:

- `uploads`
- `chat-audio`
- `scene-videos`

Server routes use the service-role key for writes. Public URLs are used for judges/demo playback so the app does not depend on local disk once deployed.
