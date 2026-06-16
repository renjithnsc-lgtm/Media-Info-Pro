// ==========================================================================
// db/connection.js — Hybrid Database Connection Manager
// Manages MySQL connection pool (primary) and SQLite (fallback)
// ==========================================================================

const { Pool: PostgresPool } = require('pg');
const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Active engine tracker
let activeEngine = 'postgres'; // 'postgres', 'mysql', or 'sqlite'
let postgresPool = null;
let mysqlPool = null;
let sqliteDb = null;

// ---- PostgreSQL Pool Initialization ----
function createPostgresPool() {
    try {
        const connectionString = process.env.NEON_URL;
        if (!connectionString) {
            console.warn('[DB] NEON_URL not set; cannot create Postgres pool.');
            return null;
        }
        const pool = new PostgresPool({
            connectionString,
            ssl: { rejectUnauthorized: false } // Neon requires SSL
        });
        console.log('[DB] PostgreSQL (Neon) connection pool created.');
        return pool;
    } catch (err) {
        console.error('[DB] Failed to create PostgreSQL pool:', err.message);
        return null;
    }
}

// ---- MySQL Pool Initialization ----
function createMySQLPool() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'mediainfo_pro',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            connectTimeout: 5000
        });
        console.log('[DB] MySQL connection pool created.');
        return pool;
    } catch (err) {
        console.error('[DB] Failed to create MySQL pool:', err.message);
        return null;
    }
}

// ---- SQLite Initialization (Promise-wrapped) ----
function createSQLiteClient() {
    const dbPath = process.env.SQLITE_PATH || path.join(__dirname, '..', 'airone.db');
    
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('[DB] Failed to open SQLite database:', err.message);
                reject(err);
            } else {
                console.log(`[DB] SQLite database initialized at: ${dbPath}`);
                // Enable WAL mode for better concurrent performance
                db.run('PRAGMA journal_mode=WAL;');
                db.run('PRAGMA foreign_keys=ON;');
                resolve(db);
            }
        });
    });
}

// Wrap SQLite to match MySQL's promise-based query(sql, params) → [rows, fields]
function wrapSQLiteQuery(db) {
    return {
        query: (sql, params = []) => {
            return new Promise((resolve, reject) => {
                const trimmedSQL = sql.trim().toUpperCase();

                // Determine if this is a SELECT/SHOW/PRAGMA (returns rows) or mutating operation
                if (
                    trimmedSQL.startsWith('SELECT') ||
                    trimmedSQL.startsWith('SHOW') ||
                    trimmedSQL.startsWith('PRAGMA')
                ) {
                    db.all(sql, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve([rows || [], []]);
                    });
                } else {
                    db.run(sql, params, function (err) {
                        if (err) reject(err);
                        else {
                            resolve([
                                {
                                    insertId: this.lastID,
                                    affectedRows: this.changes,
                                    changedRows: this.changes
                                },
                                []
                            ]);
                        }
                    });
                }
            });
        },
        // For connection testing
        getConnection: async () => {
            return { release: () => {} };
        }
    };
}

// ---- Public API ----

async function initialize() {
    // Initialize SQLite fallback (always ready)
    const rawSqliteDb = await createSQLiteClient();
    sqliteDb = wrapSQLiteQuery(rawSqliteDb);

    // Attempt PostgreSQL connection
    postgresPool = createPostgresPool();
    if (postgresPool) {
        try {
            await postgresPool.query('SELECT 1');
            activeEngine = 'postgres';
            console.log('[DB] ✅ PostgreSQL (Neon) is reachable. Using PostgreSQL as primary database.');
        } catch (err) {
            console.warn('[DB] ⚠️  PostgreSQL is unreachable:', err.message);
            console.log('[DB] 🔄 Falling back to SQLite database.');
            activeEngine = 'sqlite';
        }
    } else {
        console.warn('[DB] ⚠️  PostgreSQL pool could not be created.');
        activeEngine = 'sqlite';
    }
    return activeEngine;
}

function getActiveEngine() {
    return activeEngine;
}

function setActiveEngine(engine) {
    activeEngine = engine;
    console.log(`[DB] 🔄 Active database engine switched to: ${engine.toUpperCase()}`);
}

function getPostgresPool() {
    return postgresPool;
}

function getMySQLPool() {
    return mysqlPool;
}

function getSQLiteClient() {
    return sqliteDb;
}

function getActiveClient() {
    if (activeEngine === 'postgres') return getPostgresPool();
    if (activeEngine === 'mysql') return getMySQLPool();
    return sqliteDb;
}

module.exports = {
    initialize,
    getActiveEngine,
    setActiveEngine,
    getMySQLPool,
    getPostgresPool,
    getSQLiteClient,
    getActiveClient
};
