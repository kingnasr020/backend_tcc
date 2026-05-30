const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  user: 'adminapp',
  password: 'Marketplace2026#', // Gunakan password yang sudah dipastikan benar
  database: 'marketplace_db',
  // Untuk Cloud Run, kita gunakan socketPath, BUKAN host/port
  socketPath: '/cloudsql/project-5ffb3e49-1a93-45bf-b6b:us-central1:marketplace-db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;