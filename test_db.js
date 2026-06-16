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
        
        console.log('Running count of programmes...');
        const countStart = Date.now();
        const [progRows] = await db.query('SELECT COUNT(*) as count FROM programmes');
        console.log('Programmes count:', progRows, `took ${Date.now() - countStart}ms`);
        
        process.exit(0);
    } catch (err) {
        console.error('Test error:', err);
        process.exit(1);
    }
}

runTest();
