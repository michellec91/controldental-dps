const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

require("dotenv").config();

async function runSeeders() {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      multipleStatements: true,
    });

    const seedersPath = path.join(
      __dirname,
      "../seeders"
    );

    const files = fs
      .readdirSync(seedersPath)
      .filter(
        (file) =>
          file.endsWith(".sql") ||
          file.endsWith(".js")
      )
      .sort();

    for (const file of files) {
      const filePath = path.join(
        seedersPath,
        file
      );

      console.log(
        `Ejecutando seeder: ${file}`
      );

      // Seeder SQL
      if (file.endsWith(".sql")) {
        const sql = fs.readFileSync(
          filePath,
          "utf8"
        );

        await connection.query(sql);
      }

      // Seeder JavaScript
      if (file.endsWith(".js")) {
        const seeder = require(filePath);

        await seeder(connection);
      }
    }

    console.log(
      "Seeders completados correctamente."
    );
  } catch (error) {
    console.error(
      "Error ejecutando seeders:",
      error
    );

    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSeeders();