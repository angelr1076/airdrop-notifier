import Database from 'better-sqlite3';

const DB_PATH = process.env.DB_PATH ?? './airdrop-notifier.db';
export const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS seen_items(
    source TEXT NOT NULL,
    item_id TEXT NOT NULL,
    ts INTEGER NOT NULL,
    PRIMARY KEY(source, item_id)
  );
`);
export const hasSeen = db
  .prepare('SELECT 1 FROM seen_items WHERE source=? AND item_id=?')
  .pluck();
export const markSeen = db.prepare(
  'INSERT OR IGNORE INTO seen_items(source,item_id,ts) VALUES (?,?,?)'
);
