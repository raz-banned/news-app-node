import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(__dirname, "../../database.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    category TEXT NOT NULL DEFAULT 'Общество',
    image_url TEXT,
    views INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (author_id) REFERENCES users(id)
  );
`);

// Migration — для баз, созданных до добавления этих колонок
const columns = (db.pragma("table_info(articles)") as { name: string }[]).map(
  (c) => c.name,
);

if (!columns.includes("category"))
  db.exec(
    "ALTER TABLE articles ADD COLUMN category TEXT NOT NULL DEFAULT 'Общество'",
  );
if (!columns.includes("image_url"))
  db.exec("ALTER TABLE articles ADD COLUMN image_url TEXT");
if (!columns.includes("views"))
  db.exec("ALTER TABLE articles ADD COLUMN views INTEGER NOT NULL DEFAULT 0");

export default db;
