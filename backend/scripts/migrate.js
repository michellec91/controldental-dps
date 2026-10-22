const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    multipleStatements: true,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
  );

  await connection.query(`USE \`${process.env.DB_NAME}\``);

  const migrationsPath = path.join(__dirname, "../migrations");

  const files = fs
    .readdirSync(migrationsPath)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsPath, file);
    const sql = fs.readFileSync(filePath, "utf8");

    console.log(`Ejecutando migration: ${file}`);

    await connection.query(sql);
  }

  console.log("Migraciones completadas correctamente.");

  await connection.end();
}

runMigrations().catch((error) => {
  console.error("Error ejecutando migraciones:", error);
  process.exit(1);
});