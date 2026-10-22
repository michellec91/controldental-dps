const bcrypt = require("bcrypt");

async function seedAdmin(connection) {
  const correo = "admin@controldental.com";
  const password = "Admin1234";

  const [usuarios] = await connection.query(
    "SELECT id_usuario FROM usuarios WHERE correo = ?",
    [correo]
  );

  if (usuarios.length > 0) {
    console.log("Administrador ya existe, se omite.");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await connection.query(
    `INSERT INTO usuarios
    (
      nombre,
      apellido,
      correo,
      password,
      telefono,
      rol,
      estado,
      imagen_perfil
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      "José Luis",
      "Pérez",
      correo,
      hashedPassword,
      "00000000",
      "Administrador",
      "Activo",
      null,
    ]
  );

  console.log("Administrador creado correctamente.");
}

module.exports = seedAdmin;