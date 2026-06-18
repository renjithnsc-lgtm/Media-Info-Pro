require('dotenv').config();
const connection = require('./db/connection');
const db = require('./db/queryWrapper');

async function runTest() {
    try {
        console.log('Initializing connection...');
        const engine = await connection.initialize();
        console.log('Active DB Engine:', engine);
        
        console.log('Running SELECT 1...');
        const start = Date.now();
        const [rows] = await db.query('SELECT 1');
        console.log('SELECT 1 result:', rows, `took ${Date.now() - start}ms`);
        
        console.log('Searching for bullet names...');
        const [bulletRows] = await db.query("SELECT name FROM programmes WHERE name LIKE '%•%' OR name LIKE '%bullet%'");
        console.log('Bullet names found:', bulletRows);
        
        console.log('Searching for SAJEEV...');
        const [sajeevRows] = await db.query("SELECT name FROM programmes WHERE exec_name LIKE '%SAJEEV%'");
        console.log('Sajeev programmes:', sajeevRows);
        
        process.exit(0);
    } catch (err) {
        console.error('Test error:', err);
        process.exit(1);
    }
}

runTest();
