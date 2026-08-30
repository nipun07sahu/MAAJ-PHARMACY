const { Pool } = require("pg");

const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  database: "medistore",
  // Password is intentionally not written here.
  // Set it in the environment before starting the backend:
  // set PGPASSWORD=YOUR_POSTGRES_PASSWORD
});

pool.on("error", (err) => {
  console.error("PostgreSQL pool error:", err.message);
});

module.exports = pool;