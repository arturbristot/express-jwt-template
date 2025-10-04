import dotenv from 'dotenv';
dotenv.config();

import { Pool } from "pg";

console.log('DB Config:', {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD ? '***' : 'undefined',
    port: process.env.DB_PORT
});

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on("connect", () => {
    console.log("Conectado ao PostgreSQL");
});

pool.on("error", (err) => {
    console.error("Erro de conexão com o PostgreSQL", err);
});

export default pool;