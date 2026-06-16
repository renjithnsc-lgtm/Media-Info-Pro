// ==========================================================================
// db/queryWrapper.js — Smart Query Interceptor & SQL Translator
// Tries MySQL first, falls back to SQLite on connection errors.
// Patches SQL syntax automatically for SQLite compatibility.
// ==========================================================================

const connection = require('./connection');

// Connection-related error codes that trigger failover
const FAILOVER_CODES = [
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'PROTOCOL_CONNECTION_LOST',
    'ECONNRESET',
    'ER_ACCESS_DENIED_ERROR',
    'EHOSTUNREACH',
    'EPIPE'
];

// ---- SQL Translation for SQLite ----

function translateForSQLite(sql) {
    let translated = sql;

    // 1. Remove AUTO_INCREMENT from CREATE TABLE statements
    translated = translated.replace(/\s*AUTO_INCREMENT\s*/gi, ' ');

    // 2. Replace INSERT IGNORE with INSERT OR IGNORE
    translated = translated.replace(/INSERT\s+IGNORE/gi, 'INSERT OR IGNORE');

    // 3. Rewrite SHOW COLUMNS FROM `tableName` or SHOW COLUMNS FROM tableName
    const showColumnsMatch = translated.match(/SHOW\s+COLUMNS\s+FROM\s+[`']?(\w+)[`']?/i);
    if (showColumnsMatch) {
        const tableName = showColumnsMatch[1];
        translated = `PRAGMA table_info(${tableName})`;
    }

    // 4. Rewrite SHOW TABLES
    if (/^\s*SHOW\s+TABLES\s*/i.test(translated)) {
        translated = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
    }

    // 5. Replace MySQL IFNULL with SQLite-compatible IFNULL (same syntax, no change needed)

    // 6. Replace ON DUPLICATE KEY UPDATE with nothing (SQLite uses UPSERT differently)
    //    This is a basic translation; complex UPSERT may need manual adjustment
    translated = translated.replace(/\s*ON\s+DUPLICATE\s+KEY\s+UPDATE\s+.*/gi, '');

    // 7. Remove MySQL-specific ENGINE= and CHARSET= from CREATE TABLE
    translated = translated.replace(/\s*ENGINE\s*=\s*\w+/gi, '');
    translated = translated.replace(/\s*DEFAULT\s+CHARSET\s*=\s*\w+/gi, '');
    translated = translated.replace(/\s*COLLATE\s*=\s*[\w_]+/gi, '');
    translated = translated.replace(/\s*CHARACTER\s+SET\s+\w+/gi, '');

    // 8. Replace UNSIGNED (not supported in SQLite)
    translated = translated.replace(/\s+UNSIGNED/gi, '');

    // 9. Replace MySQL NOW() with SQLite datetime('now')
    translated = translated.replace(/\bNOW\(\)/gi, "datetime('now')");

    // 9.5 Replace PostgreSQL SERIAL with INTEGER PRIMARY KEY AUTOINCREMENT
    translated = translated.replace(/\bSERIAL\s+PRIMARY\s+KEY\b/gi, 'INTEGER PRIMARY KEY AUTOINCREMENT');

    // 10. Replace MySQL INT types with INTEGER for SQLite compatibility
    translated = translated.replace(/\bINT\b(?!\s*\()/gi, 'INTEGER');
    translated = translated.replace(/\bBIGINT\b/gi, 'INTEGER');
    translated = translated.replace(/\bTINYINT\b/gi, 'INTEGER');
    translated = translated.replace(/\bSMALLINT\b/gi, 'INTEGER');
    translated = translated.replace(/\bMEDIUMINT\b/gi, 'INTEGER');

    return translated;
}

// ---- Smart Query Function ----

async function query(sql, params = []) {
    const engine = connection.getActiveEngine();

    if (engine === 'postgres') {
            try {
                const pool = connection.getPostgresPool();
                if (!pool) throw { code: 'ECONNREFUSED' };
                
                // Convert MySQL/SQLite '?' placeholders to PostgreSQL '$1', '$2', etc.
                let paramIndex = 1;
                let pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
                
                // Check if this is an INSERT statement and doesn't already have RETURNING
                const isInsert = /^\s*INSERT\s+/i.test(pgSql);
                const hasReturning = /\bRETURNING\b/i.test(pgSql);
                if (isInsert && !hasReturning) {
                    pgSql += ' RETURNING id';
                }

                const result = await pool.query(pgSql, params);
                
                if (isInsert) {
                    const insertId = (result.rows && result.rows[0]) ? (result.rows[0].id || result.rows[0].insertid) : null;
                    return [
                        {
                            insertId: insertId,
                            affectedRows: result.rowCount,
                            changedRows: 0
                        },
                        result.fields
                    ];
                }

                // pg returns rows directly; wrap to match [rows, fields]
                return [result.rows, result.fields];
            } catch (err) {
                const errCode = err.code || '';
                const errMessage = (err.message || '').toUpperCase();
                const isConnectionError = FAILOVER_CODES.some(code => errCode === code || errMessage.includes(code));
                if (isConnectionError) {
                    console.warn(`[QueryWrapper] ⚠️  PostgreSQL error (${errCode}): ${err.message}`);
                    console.log('[QueryWrapper] 🔄 Switching to SQLite and retrying query...');
                    connection.setActiveEngine('sqlite');
                    const translatedSQL = translateForSQLite(sql);
                    const sqliteClient = connection.getSQLiteClient();
                    return await sqliteClient.query(translatedSQL, params);
                } else {
                    throw err;
                }
            }
        } else if (engine === 'mysql') {

        try {
            const pool = connection.getMySQLPool();
            if (!pool) throw { code: 'ECONNREFUSED' };
            const result = await pool.query(sql, params);
            return result;
        } catch (err) {
            const errCode = err.code || '';
            const errMessage = (err.message || '').toUpperCase();

            // Check if the error is connection-related
            const isConnectionError = FAILOVER_CODES.some(code =>
                errCode === code || errMessage.includes(code)
            );

            if (isConnectionError) {
                console.warn(`[QueryWrapper] ⚠️  MySQL error (${errCode}): ${err.message}`);
                console.log('[QueryWrapper] 🔄 Switching to SQLite and retrying query...');
                connection.setActiveEngine('sqlite');

                // Retry with SQLite
                const translatedSQL = translateForSQLite(sql);
                const sqliteClient = connection.getSQLiteClient();
                return await sqliteClient.query(translatedSQL, params);
            } else {
                // Non-connection error — propagate it
                throw err;
            }
        }
    } else {
        // SQLite mode
        const translatedSQL = translateForSQLite(sql);
        const sqliteClient = connection.getSQLiteClient();
        return await sqliteClient.query(translatedSQL, params);
    }
}

// ---- Export ----

module.exports = {
    query,
    translateForSQLite
};
