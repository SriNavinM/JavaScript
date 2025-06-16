const { Pool } = require('pg');

const pool = new Pool ({
    user: 'postgres',
    host: 'localhost',
    database: 'taskdb',
    port: 5432,
    password: 'postgres'
});

module.exports = pool;