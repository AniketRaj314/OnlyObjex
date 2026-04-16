import { mkdir } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { ObjexProfile, StoredObjex } from "@/lib/schemas/objex";
import { storedObjexSchema } from "@/lib/schemas/objex";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "onlyobjex.db");

let database: DatabaseSync | undefined;

function getDatabase() {
  if (database) {
    return database;
  }

  database = new DatabaseSync(dbPath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS objex (
      id TEXT PRIMARY KEY,
      image_path TEXT NOT NULL,
      image_public_url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      profile_json TEXT NOT NULL
    )
  `);

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
        profile_json
      ) VALUES (?, ?, ?, ?, ?)
    `,
  ).run(
    record.id,
    record.imagePath,
    record.imagePublicUrl,
    record.createdAt,
    JSON.stringify(record.profile),
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
    profile: JSON.parse(row.profileJson),
  });
}
