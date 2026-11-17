
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';

dotenv.config();

// Load the SSL certificate.
// Render uses DB_CA_CERT.
// Local development uses backend/ca.pem.
const caCertificate = process.env.DB_CA_CERT
    ? process.env.DB_CA_CERT.replace(/\\n/g, '\n')
    : readFileSync(new URL('../ca.pem', import.meta.url));

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),

    ssl: {
        ca: caCertificate,
        rejectUnauthorized: true
    },

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const testConnection = async () => {
    try {
        const connection = await db.getConnection();

        console.log('Aiven MySQL Database Connected Successfully!');

        connection.release();
    } catch (error) {
        console.error('Database Connection Failed:', error.message);
        throw error;
    }
};

export default db;
