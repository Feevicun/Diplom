import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.NODE_ENV === 'production' ? 'db' : 'localhost',
  port: 5432,
  user: 'vikaosoba',
  password: 'Feevicun29',
  database: 'Diplom',
});

export default pool;