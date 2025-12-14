import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.POSTGRES_HOSTNAME,
    port: 5432,
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DBNAME,
});

export async function queryMany(query, values = undefined) {
    const client = await pool.connect();
    try {
        const result = await client.query(query, values);
        return result.rows;
    } finally {
        client.release();
    }
}

export async function queryOne(query, values = undefined) {
    const rows = await queryMany(query, values);
    return rows.length > 0 ? rows[0] : null;
}
