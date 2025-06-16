import dotenv from 'dotenv'
dotenv.config();
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user:process.env.DB_USER,
  host: process.env.DB_HOST,       // 'localhost' or IP address
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,              // default PostgreSQL port
 
});

export default pool