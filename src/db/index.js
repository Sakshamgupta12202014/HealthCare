import PG from "pg";
const { Pool } = PG;

const pool = new Pool({
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    port: 5432,
    ssl: {
        require: true,
        rejectUnauthorized: false, 
    },
});

export default pool;
