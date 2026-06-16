// ==========================================================================
// server.js — Media-Info Pro 1.0 Express Server Entry Point
// ==========================================================================

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const dbConnection = require('./db/connection');
const { initializeSchema } = require('./db/schema');
const programmesRouter = require('./routes/programmes');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Static File Uploads ----
// Determine the uploads directory (Vercel uses /tmp)
const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION;
const uploadsDir = isVercel
    ? path.join('/tmp', 'uploads')
    : path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`[Server] Created uploads directory: ${uploadsDir}`);
}

app.use('/uploads', express.static(uploadsDir));

const jwt = require('jsonwebtoken');

// ---- Database Initialization (Serverless Support) ----
let isDbInitialized = false;
let dbInitPromise = null;

async function ensureDbInitialized() {
    if (!isDbInitialized) {
        if (!dbInitPromise) {
            dbInitPromise = (async () => {
                console.log('[Server] Initializing database connections...');
                const engine = await dbConnection.initialize();
                await initializeSchema();
                console.log(`[Server] Active database engine: ${engine.toUpperCase()}`);
                isDbInitialized = true;
            })().catch(err => {
                dbInitPromise = null; // Allow retry on next request
                throw err;
            });
        }
        await dbInitPromise;
    }
}

app.use(async (req, res, next) => {
    // Ensure DB is initialized before any /api/ requests
    if (req.path.startsWith('/api/')) {
        try {
            await ensureDbInitialized();
        } catch (err) {
            console.error('[Server] Database initialization failed:', err);
            return res.status(500).json({ success: false, message: 'DB Error: ' + (err.message || String(err)) });
        }
    }
    next();
});

// ---- Serve Frontend (public directory) ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- Authentication Endpoint ----
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'password123';
    const jwtSecret = process.env.JWT_SECRET || 'super_secret_key_123_change_me';

    if (username === adminUser && password === adminPass) {
        const token = jwt.sign({ username }, jwtSecret, { expiresIn: '24h' });
        return res.json({ success: true, token });
    } else {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});

// ---- Auth Middleware ----
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const jwtSecret = process.env.JWT_SECRET || 'super_secret_key_123_change_me';
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

// ---- API Routes ----
app.use('/api/programmes', verifyToken, programmesRouter);


// ---- Status & Health Check ----
app.get('/api/status', (req, res) => {
    const dbConn = require('./db/connection');
    res.json({
        status: 'ok',
        engine: dbConn.getActiveEngine(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// ---- SPA Fallback: Serve app.html for unknown routes ----
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'app.html'));
});

// ---- Bootstrap & Serverless Export ----
if (process.env.VERCEL !== '1' && !process.env.NOW_REGION) {
    // Running locally or on a traditional server
    ensureDbInitialized().then(() => {
        app.listen(PORT, () => {
            console.log('');
            console.log('╔══════════════════════════════════════════════════╗');
            console.log('║     Media-Info Pro 1.0 — Server Running...       ║');
            console.log('╚══════════════════════════════════════════════════╝');
            console.log(`[Server] ✅ Listening at: http://localhost:${PORT}`);
            console.log(`[Server] 📂 Uploads directory: ${uploadsDir}`);
            console.log('');
        });
    }).catch(err => {
        console.error('[Server] ❌ Fatal startup error:', err);
        process.exit(1);
    });
}

// Export the Express app so Vercel can use it as a Serverless Function
module.exports = app;
