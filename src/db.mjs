import { Pool } from 'pg';

const conn = process.env.DATABASE_URL;
if (!conn) {
  console.error('Set DATABASE_URL for Postgres');
  process.exit(1);
}

const pool = new Pool({
  connectionString: conn,
  ssl: { rejectUnauthorized: false },
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS seen_items (
    source  TEXT NOT NULL,
    item_id TEXT NOT NULL,
    ts      BIGINT NOT NULL,
    PRIMARY KEY (source, item_id)
  );
`);

export async function hasSeen(source, itemId) {
  const resp = await pool.query(
    'SELECT 1 FROM seen_items WHERE source = $1 AND item_id = $2 LIMIT 1',
    [source, itemId]
  );
  return resp.rowCount > 0;
}

export async function markSeen(source, itemId, ts) {
  await pool.query(
    `INSERT INTO seen_items(source, item_id, ts)
    VALUES ($1, $2, $3)
    ON CONFLICT (source, item_id) DO NOTHING`,
    [source, itemId, ts]
  );
}

export async function closeDb() {
  await pool.end();
}
