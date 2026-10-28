import sqlite3
import os
from contextlib import contextmanager

DB_FILE = os.getenv("SQLITE_DB_PATH", os.path.join(os.path.dirname(os.path.dirname(__file__)), "croprescue.db"))

def get_db_connection():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

@contextmanager
def get_db():
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    with get_db() as conn:
        conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('farmer', 'buyer')),
            created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS harvest_listings (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            farmer_name TEXT NOT NULL,
            crop TEXT NOT NULL,
            variety TEXT,
            quantity REAL NOT NULL,
            unit TEXT NOT NULL CHECK(unit IN ('quintal', 'kg')),
            grade TEXT NOT NULL,
            harvest_date TEXT NOT NULL,
            selling_deadline TEXT NOT NULL,
            state TEXT NOT NULL,
            district TEXT NOT NULL,
            asking_price REAL,
            storage_available INTEGER NOT NULL DEFAULT 0,
            storage_cost_per_day REAL DEFAULT 0,
            spoilage_rate REAL DEFAULT 0,
            max_transport_km REAL DEFAULT 300,
            min_selling_price REAL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'sold', 'withdrawn')),
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS buyer_interests (
            id TEXT PRIMARY KEY,
            listing_id TEXT NOT NULL,
            buyer_id TEXT NOT NULL,
            buyer_name TEXT NOT NULL,
            buyer_email TEXT NOT NULL,
            buyer_phone TEXT,
            proposed_price REAL,
            message TEXT,
            created_at TEXT NOT NULL,
            UNIQUE(listing_id, buyer_id),
            FOREIGN KEY (listing_id) REFERENCES harvest_listings(id) ON DELETE CASCADE,
            FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
        );
        """)
