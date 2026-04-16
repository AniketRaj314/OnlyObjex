import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type {
  ObjexChatMessage,
  ObjexChatMessageRole,
  ObjexProfile,
  StoredObjex,
} from "@/lib/schemas/objex";
import { objexChatMessageSchema, storedObjexSchema } from "@/lib/schemas/objex";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "onlyobjex.db");

let database: DatabaseSync | undefined;

function getColumns(db: DatabaseSync) {
  return db.prepare("PRAGMA table_info(objex)").all() as Array<{
    name: string;
  }>;
}

function ensureObjexSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS objex (
      id TEXT PRIMARY KEY,
      image_path TEXT NOT NULL,
      image_public_url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      profile_json TEXT NOT NULL
    )
  `);

  const columns = getColumns(db).map((column) => column.name);

  if (!columns.includes("is_published")) {
    db.exec(
      "ALTER TABLE objex ADD COLUMN is_published INTEGER NOT NULL DEFAULT 0",
    );
  }

  if (!columns.includes("published_at")) {
    db.exec("ALTER TABLE objex ADD COLUMN published_at TEXT");
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS objex_chat_messages (
      id TEXT PRIMARY KEY,
      objex_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      audio_public_url TEXT,
      FOREIGN KEY(objex_id) REFERENCES objex(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS objex_chat_messages_objex_created_at_idx
    ON objex_chat_messages (objex_id, created_at)
  `);
  }

function getDatabase() {
  if (database) {
    return database;
  }

  database = new DatabaseSync(dbPath);
  ensureObjexSchema(database);

  return database;
}

export async function initializeDatabase() {
  await mkdir(dataDir, { recursive: true });
  getDatabase();
}

export async function saveObjex(record: {
  id: string;
  imagePath: string;
  imagePublicUrl: string;
  createdAt: string;
  profile: ObjexProfile;
}) {
  await initializeDatabase();
  const db = getDatabase();

  db.prepare(
    `
      INSERT INTO objex (
        id,
        image_path,
        image_public_url,
        created_at,
        profile_json,
        is_published,
        published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    record.id,
    record.imagePath,
    record.imagePublicUrl,
    record.createdAt,
    JSON.stringify(record.profile),
    0,
    null,
  );
}

export async function getObjexById(id: string): Promise<StoredObjex | null> {
  await initializeDatabase();
  const db = getDatabase();

  const row = db
    .prepare(
      `
        SELECT
          id,
          image_path as imagePath,
          image_public_url as imagePublicUrl,
          created_at as createdAt,
          is_published as isPublished,
          published_at as publishedAt,
          profile_json as profileJson
        FROM objex
        WHERE id = ?
      `,
    )
    .get(id) as
    | {
        id: string;
        imagePath: string;
        imagePublicUrl: string;
        createdAt: string;
        isPublished: number;
        publishedAt: string | null;
        profileJson: string;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return storedObjexSchema.parse({
    id: row.id,
    imagePath: row.imagePath,
    imagePublicUrl: row.imagePublicUrl,
    createdAt: row.createdAt,
    isPublished: Boolean(row.isPublished),
    publishedAt: row.publishedAt,
    profile: JSON.parse(row.profileJson),
  });
}

export async function setObjexPublishedState(
  id: string,
  isPublished: boolean,
): Promise<StoredObjex | null> {
  await initializeDatabase();
  const db = getDatabase();
  const publishedAt = isPublished ? new Date().toISOString() : null;

  db.prepare(
    `
      UPDATE objex
      SET
        is_published = ?,
        published_at = ?
      WHERE id = ?
    `,
  ).run(isPublished ? 1 : 0, publishedAt, id);

  return getObjexById(id);
}

export async function listPublishedObjex(): Promise<StoredObjex[]> {
  await initializeDatabase();
  const db = getDatabase();
  const rows = db
    .prepare(
      `
        SELECT
          id,
          image_path as imagePath,
          image_public_url as imagePublicUrl,
          created_at as createdAt,
          is_published as isPublished,
          published_at as publishedAt,
          profile_json as profileJson
        FROM objex
        WHERE is_published = 1
        ORDER BY COALESCE(published_at, created_at) DESC
      `,
    )
    .all() as Array<{
    id: string;
    imagePath: string;
    imagePublicUrl: string;
    createdAt: string;
    isPublished: number;
    publishedAt: string | null;
    profileJson: string;
  }>;

  return rows.map((row) =>
    storedObjexSchema.parse({
      id: row.id,
      imagePath: row.imagePath,
      imagePublicUrl: row.imagePublicUrl,
      createdAt: row.createdAt,
      isPublished: Boolean(row.isPublished),
      publishedAt: row.publishedAt,
      profile: JSON.parse(row.profileJson),
    }),
  );
}

function parseChatMessageRow(row: {
  id: string;
  objexId: string;
  role: string;
  content: string;
  createdAt: string;
  audioPublicUrl: string | null;
}) {
  return objexChatMessageSchema.parse(row);
}

export async function ensureObjexChatStarterMessage(record: {
  objexId: string;
  openingMessage: string;
}) {
  await initializeDatabase();
  const db = getDatabase();
  const row = db
    .prepare(
      `
        SELECT COUNT(*) as count
        FROM objex_chat_messages
        WHERE objex_id = ?
      `,
    )
    .get(record.objexId) as { count: number };

  if (row.count > 0) {
    return;
  }

  db.prepare(
    `
      INSERT INTO objex_chat_messages (
        id,
        objex_id,
        role,
        content,
        created_at,
        audio_public_url
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
  ).run(
    randomUUID(),
    record.objexId,
    "assistant",
    record.openingMessage,
    new Date().toISOString(),
    null,
  );
}

export async function listObjexChatMessages(
  objexId: string,
): Promise<ObjexChatMessage[]> {
  await initializeDatabase();
  const db = getDatabase();
  const rows = db
    .prepare(
      `
        SELECT
          id,
          objex_id as objexId,
          role,
          content,
          created_at as createdAt,
          audio_public_url as audioPublicUrl
        FROM objex_chat_messages
        WHERE objex_id = ?
        ORDER BY created_at ASC
      `,
    )
    .all(objexId) as Array<{
    id: string;
    objexId: string;
    role: string;
    content: string;
    createdAt: string;
    audioPublicUrl: string | null;
  }>;

  return rows.map(parseChatMessageRow);
}

export async function saveObjexChatMessage(record: {
  objexId: string;
  role: ObjexChatMessageRole;
  content: string;
  createdAt?: string;
  audioPublicUrl?: string | null;
}): Promise<ObjexChatMessage> {
  await initializeDatabase();
  const db = getDatabase();
  const id = randomUUID();
  const createdAt = record.createdAt ?? new Date().toISOString();
  const audioPublicUrl = record.audioPublicUrl ?? null;

  db.prepare(
    `
      INSERT INTO objex_chat_messages (
        id,
        objex_id,
        role,
        content,
        created_at,
        audio_public_url
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
  ).run(id, record.objexId, record.role, record.content, createdAt, audioPublicUrl);

  return parseChatMessageRow({
    id,
    objexId: record.objexId,
    role: record.role,
    content: record.content,
    createdAt,
    audioPublicUrl,
  });
}
