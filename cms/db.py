import os
import sqlite3
import threading
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, 'data')
DB_PATH = os.path.join(DATA_DIR, 'geoland.db')

_lock = threading.Lock()
_conn = None

SCHEMA = """
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL,
  pw_hash TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY, username TEXT NOT NULL, expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY, base TEXT UNIQUE NOT NULL,
  original_name TEXT DEFAULT '', alt TEXT DEFAULT '',
  width INTEGER, height INTEGER, widths TEXT DEFAULT '',
  is_upload INTEGER DEFAULT 1, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('gis-agri','software','cadastre','forestry')),
  year INTEGER, org TEXT DEFAULT '',
  description TEXT DEFAULT '', image_media_id INTEGER REFERENCES media(id),
  featured INTEGER DEFAULT 0, featured_rank INTEGER DEFAULT 100,
  published INTEGER DEFAULT 0, created_at TEXT, updated_at TEXT);
CREATE TABLE IF NOT EXISTS project_images (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL REFERENCES media(id),
  sort INTEGER DEFAULT 100, PRIMARY KEY (project_id, media_id));
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY, anchor TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  short_scope TEXT DEFAULT '', scope_items TEXT DEFAULT '',
  deliverables TEXT DEFAULT '', image_media_id INTEGER REFERENCES media(id),
  sort INTEGER DEFAULT 100, published INTEGER DEFAULT 1, updated_at TEXT);
CREATE TABLE IF NOT EXISTS milestones (
  id INTEGER PRIMARY KEY, year INTEGER NOT NULL, text TEXT NOT NULL,
  sort INTEGER DEFAULT 100, published INTEGER DEFAULT 1, updated_at TEXT);
CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY, ts TEXT NOT NULL, actor TEXT NOT NULL,
  action TEXT NOT NULL, entity TEXT NOT NULL, entity_id INTEGER, summary TEXT NOT NULL);
"""


def now():
    return datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')


def connect():
    global _conn
    if _conn is None:
        os.makedirs(DATA_DIR, exist_ok=True)
        _conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        _conn.row_factory = sqlite3.Row
        _conn.execute('PRAGMA journal_mode=WAL')
        _conn.execute('PRAGMA foreign_keys=ON')
    return _conn


def init_schema():
    with _lock:
        connect().executescript(SCHEMA)
        connect().commit()


def query(sql, params=()):
    return connect().execute(sql, params).fetchall()


def one(sql, params=()):
    return connect().execute(sql, params).fetchone()


def execute(sql, params=()):
    with _lock:
        cur = connect().execute(sql, params)
        connect().commit()
        return cur


def log(actor, action, entity, entity_id, summary):
    execute(
        'INSERT INTO activity (ts, actor, action, entity, entity_id, summary) VALUES (?,?,?,?,?,?)',
        (now(), actor, action, entity, entity_id, summary))
