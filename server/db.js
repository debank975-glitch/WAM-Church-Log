const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const config = require('./config');

const provider = String(config.databaseProvider || 'sqlite').toLowerCase();

class PostgresStatement {
  constructor(connection, sql) {
    this.connection = connection;
    this.sql = sql;
  }

  _buildQuery(params) {
    let index = 0;
    const query = this.sql.replace(/\?/g, () => {
      index += 1;
      return `$${index}`;
    });
    return { query, params };
  }

  async run(...params) {
    const { query, params: sanitized } = this._buildQuery(params);
    const result = await this.connection.query(query, sanitized);
    const rowCount = typeof result.rowCount === 'number' ? result.rowCount : 0;
    const lastInsertRowid = result.rows && result.rows.length > 0 && result.rows[0].id !== undefined ? result.rows[0].id : null;
    return { lastInsertRowid, changes: rowCount, rowCount };
  }

  async get(...params) {
    const { query, params: sanitized } = this._buildQuery(params);
    const result = await this.connection.query(query, sanitized);
    return result.rows[0] || undefined;
  }

  async all(...params) {
    const { query, params: sanitized } = this._buildQuery(params);
    const result = await this.connection.query(query, sanitized);
    return result.rows;
  }
}

function sqliteDb() {
  let SqliteDatabase;
  try {
    SqliteDatabase = require('better-sqlite3');
  } catch (error) {
    throw new Error('SQLite support requires the better-sqlite3 package. Install optional dependencies or use DATABASE_PROVIDER=postgres.', { cause: error });
  }
  fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
  const db = new SqliteDatabase(config.databasePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL COLLATE NOCASE UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
      email TEXT,
      display_name TEXT,
      must_change_password INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS invite_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code_hash TEXT NOT NULL UNIQUE,
      created_by INTEGER NOT NULL REFERENCES users(id),
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_hash TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_seen_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT NOT NULL,
      user_id INTEGER REFERENCES users(id),
      username TEXT,
      ip TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS ledger_states (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      state_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS shared_ledger_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      state_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  try { db.exec('ALTER TABLE users ADD COLUMN display_name TEXT'); } catch (error) {
    if (!String(error.message).includes('duplicate column name')) throw error;
  }
  try { db.exec('ALTER TABLE users ADD COLUMN role_title TEXT'); } catch (error) {
    if (!String(error.message).includes('duplicate column name')) throw error;
  }
  try { db.exec('ALTER TABLE users ADD COLUMN permissions TEXT'); } catch (error) {
    if (!String(error.message).includes('duplicate column name')) throw error;
  }
  try { db.exec('ALTER TABLE users ADD COLUMN must_change_password INTEGER NOT NULL DEFAULT 0'); } catch (error) {
    if (!String(error.message).includes('duplicate column name')) throw error;
  }
  const latestLedger = db.prepare('SELECT state_json, updated_at FROM ledger_states ORDER BY updated_at DESC LIMIT 1').get();
  if (latestLedger && !db.prepare('SELECT 1 FROM shared_ledger_state WHERE id=1').get()) {
    db.prepare('INSERT INTO shared_ledger_state (id,state_json,updated_at) VALUES (1,?,?)').run(latestLedger.state_json, latestLedger.updated_at);
  }

  db.ready = Promise.resolve();
  return db;
}

function postgresDb() {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is required when DATABASE_PROVIDER=postgres');
  }

  const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: config.pgSslMode === 'require' ? { rejectUnauthorized: false } : false,
    max: 10
  });

  const ensureSchema = async () => {
    const client = await pool.connect();
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS citext;');
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id BIGSERIAL PRIMARY KEY,
          username CITEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
          email TEXT,
          display_name TEXT,
          role_title TEXT,
          permissions TEXT,
          must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS role_title TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

        CREATE TABLE IF NOT EXISTS invite_codes (
          id BIGSERIAL PRIMARY KEY,
          code_hash TEXT NOT NULL UNIQUE,
          created_by BIGINT NOT NULL REFERENCES users(id),
          expires_at TIMESTAMPTZ NOT NULL,
          used_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS sessions (
          id BIGSERIAL PRIMARY KEY,
          token_hash TEXT NOT NULL UNIQUE,
          user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS audit_log (
          id BIGSERIAL PRIMARY KEY,
          event TEXT NOT NULL,
          user_id BIGINT REFERENCES users(id),
          username TEXT,
          ip TEXT,
          metadata JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS ledger_states (
          user_id BIGINT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          state_json TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS shared_ledger_state (
          id SMALLINT PRIMARY KEY CHECK (id = 1),
          state_json TEXT NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
        CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
      `);
      await client.query(`
        INSERT INTO shared_ledger_state (id, state_json, updated_at)
        SELECT 1, state_json, updated_at
        FROM ledger_states
        ORDER BY updated_at DESC
        LIMIT 1
        ON CONFLICT (id) DO NOTHING;
      `);
    } finally {
      client.release();
    }
  };

  const ready = ensureSchema();
  ready.catch((error) => {
    console.error('Unable to initialize PostgreSQL schema:', error);
  });

  return {
    pool,
    ready,
    prepare(sql) {
      return new PostgresStatement(pool, sql);
    },
    transaction(fn) {
      return async (...args) => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const tx = {
            prepare(sql) {
              return new PostgresStatement(client, sql);
            }
          };
          const result = await fn(tx, ...args);
          await client.query('COMMIT');
          return result;
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      };
    },
    exec(sql) {
      return pool.query(sql);
    },
    close() {
      return pool.end();
    }
  };
}

const db = provider === 'postgres' ? postgresDb() : sqliteDb();
module.exports = db;
