// ==========================================================================
// routes/programmes.js — CRUD API Routes for Programmes
// ==========================================================================

const express = require('express');
const router = express.Router();
const db = require('../db/queryWrapper');
const connection = require('../db/connection');

// ---- GET /api/programmes — List all programmes with team counts ----
router.get('/', async (req, res) => {
    try {
        const [programmes] = await db.query(`
            SELECT p.id, p.name, p.exec_name, p.exec_phone, p.pex, p.duties,
                   COUNT(tm.id) AS team_count
            FROM programmes p
            LEFT JOIN team_members tm ON tm.programme_id = p.id
            GROUP BY p.id, p.name, p.exec_name, p.exec_phone, p.pex, p.duties
            ORDER BY p.name ASC
        `);
        res.json({ success: true, data: programmes, engine: connection.getActiveEngine() });
    } catch (err) {
        console.error('[API] Error listing programmes:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---- GET /api/programmes/search?q=... — Search by name ----
router.get('/search', async (req, res) => {
    try {
        const q = req.query.q || '';
        const [programmes] = await db.query(
            `SELECT p.id, p.name, p.exec_name, p.exec_phone,
                    COUNT(tm.id) AS team_count
             FROM programmes p
             LEFT JOIN team_members tm ON tm.programme_id = p.id
             WHERE LOWER(p.name) LIKE LOWER(?) OR LOWER(p.exec_name) LIKE LOWER(?)
             GROUP BY p.id, p.name, p.exec_name, p.exec_phone
             ORDER BY p.name ASC`,
            [`%${q}%`, `%${q}%`]
        );
        res.json({ success: true, data: programmes });
    } catch (err) {
        console.error('[API] Error searching programmes:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---- GET /api/programmes/export/all — Export all data as JSON ----
router.get('/export/all', async (req, res) => {
    try {
        const [programmes] = await db.query('SELECT * FROM programmes ORDER BY name ASC');
        const [members] = await db.query('SELECT * FROM team_members ORDER BY programme_id, id');

        // Assemble structured output
        const exportData = programmes.map(prog => ({
            id: prog.id,
            name: prog.name,
            execName: prog.exec_name,
            execPhone: prog.exec_phone,
            pex: prog.pex,
            duties: prog.duties,
            team: members
                .filter(m => m.programme_id === prog.id)
                .map(m => ({ name: m.name, phone: m.phone }))
        }));

        res.json({ success: true, data: exportData });
    } catch (err) {
        console.error('[API] Error exporting data:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---- GET /api/programmes/:id — Get single programme with team ----
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [programmes] = await db.query('SELECT * FROM programmes WHERE id = ?', [id]);
        if (programmes.length === 0) {
            return res.status(404).json({ success: false, message: 'Programme not found' });
        }

        const programme = programmes[0];
        const [team] = await db.query(
            'SELECT id, name, phone FROM team_members WHERE programme_id = ? ORDER BY id',
            [id]
        );

        res.json({
            success: true,
            data: {
                id: programme.id,
                name: programme.name,
                execName: programme.exec_name,
                execPhone: programme.exec_phone,
                pex: programme.pex,
                duties: programme.duties,
                team: team
            }
        });
    } catch (err) {
        console.error('[API] Error fetching programme:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---- POST /api/programmes — Create new programme with team ----
router.post('/', async (req, res) => {
    try {
        const { name, execName, execPhone, pex, duties, team } = req.body;

        if (!name || !execName || !execPhone) {
            return res.status(400).json({ success: false, message: 'Name, executive name, and phone are required.' });
        }

        // Check for duplicate name
        const [existing] = await db.query('SELECT id FROM programmes WHERE LOWER(name) = LOWER(?)', [name]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: `A programme named "${name}" already exists.` });
        }

        // Insert programme
        const [result] = await db.query(
            'INSERT INTO programmes (name, exec_name, exec_phone, pex, duties) VALUES (?, ?, ?, ?, ?)',
            [name, execName, execPhone, pex || null, duties || null]
        );

        const programmeId = result.insertId;

        // Insert team members (bulk insert)
        if (team && Array.isArray(team)) {
            const validMembers = team.filter(m => m.name && m.phone);
            if (validMembers.length > 0) {
                const placeholders = validMembers.map(() => '(?, ?, ?)').join(', ');
                const values = [];
                validMembers.forEach(m => {
                    values.push(programmeId, m.name, m.phone);
                });
                await db.query(
                    `INSERT INTO team_members (programme_id, name, phone) VALUES ${placeholders}`,
                    values
                );
            }
        }

        res.status(201).json({ success: true, message: 'Programme created.', id: programmeId });
    } catch (err) {
        console.error('[API] Error creating programme:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---- PUT /api/programmes/:id — Update programme and team ----
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, execName, execPhone, pex, duties, team } = req.body;

        if (!name || !execName || !execPhone) {
            return res.status(400).json({ success: false, message: 'Name, executive name, and phone are required.' });
        }

        // Check programme exists
        const [existing] = await db.query('SELECT id FROM programmes WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Programme not found.' });
        }

        // Check for duplicate name (excluding self)
        const [duplicate] = await db.query(
            'SELECT id FROM programmes WHERE LOWER(name) = LOWER(?) AND id != ?',
            [name, id]
        );
        if (duplicate.length > 0) {
            return res.status(409).json({ success: false, message: `A programme named "${name}" already exists.` });
        }

        // Update programme
        await db.query(
            'UPDATE programmes SET name = ?, exec_name = ?, exec_phone = ?, pex = ?, duties = ? WHERE id = ?',
            [name, execName, execPhone, pex || null, duties || null, id]
        );

        // Replace team members: delete old, insert new
        await db.query('DELETE FROM team_members WHERE programme_id = ?', [id]);

        if (team && Array.isArray(team)) {
            const validMembers = team.filter(m => m.name && m.phone);
            if (validMembers.length > 0) {
                const placeholders = validMembers.map(() => '(?, ?, ?)').join(', ');
                const values = [];
                validMembers.forEach(m => {
                    values.push(id, m.name, m.phone);
                });
                await db.query(
                    `INSERT INTO team_members (programme_id, name, phone) VALUES ${placeholders}`,
                    values
                );
            }
        }

        res.json({ success: true, message: 'Programme updated.' });
    } catch (err) {
        console.error('[API] Error updating programme:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---- DELETE /api/programmes/:id — Delete programme (cascade deletes team) ----
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await db.query('SELECT name FROM programmes WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ success: false, message: 'Programme not found.' });
        }

        const progName = existing[0].name;

        // Delete team members first (for SQLite without cascade support on all configs)
        await db.query('DELETE FROM team_members WHERE programme_id = ?', [id]);
        // Delete programme
        await db.query('DELETE FROM programmes WHERE id = ?', [id]);

        res.json({ success: true, message: `"${progName}" deleted.` });
    } catch (err) {
        console.error('[API] Error deleting programme:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ---- POST /api/programmes/import — Bulk import from JSON ----
router.post('/import', async (req, res) => {
    try {
        const { data } = req.body;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ success: false, message: 'Invalid import data. Expected { data: [...] }.' });
        }

        let importedCount = 0;
        let skippedCount = 0;

        for (const prog of data) {
            if (!prog.name || !prog.execName || !prog.execPhone) {
                skippedCount++;
                continue;
            }

            // Check for existing programme with same name
            const [existing] = await db.query('SELECT id FROM programmes WHERE LOWER(name) = LOWER(?)', [prog.name]);

            let programmeId;

            if (existing.length > 0) {
                // Update existing
                programmeId = existing[0].id;
                await db.query(
                    'UPDATE programmes SET exec_name = ?, exec_phone = ?, pex = ?, duties = ? WHERE id = ?',
                    [prog.execName, prog.execPhone, prog.pex || null, prog.duties || null, programmeId]
                );
                await db.query('DELETE FROM team_members WHERE programme_id = ?', [programmeId]);
            } else {
                // Insert new
                const [result] = await db.query(
                    'INSERT INTO programmes (name, exec_name, exec_phone, pex, duties) VALUES (?, ?, ?, ?, ?)',
                    [prog.name, prog.execName, prog.execPhone, prog.pex || null, prog.duties || null]
                );
                programmeId = result.insertId;
            }

            // Insert team members (bulk insert)
            if (prog.team && Array.isArray(prog.team)) {
                const validMembers = prog.team.filter(m => m.name && m.phone);
                if (validMembers.length > 0) {
                    const placeholders = validMembers.map(() => '(?, ?, ?)').join(', ');
                    const values = [];
                    validMembers.forEach(m => {
                        values.push(programmeId, m.name, m.phone);
                    });
                    await db.query(
                        `INSERT INTO team_members (programme_id, name, phone) VALUES ${placeholders}`,
                        values
                    );
                }
            }

            importedCount++;
        }

        res.json({
            success: true,
            message: `Imported ${importedCount} programme(s). Skipped ${skippedCount}.`
        });
    } catch (err) {
        console.error('[API] Error importing data:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
