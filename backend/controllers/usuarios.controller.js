const db = require("../config/db");
const bcrypt = require("bcrypt");

// --------------------------------------------------
// REGISTRAR USUARIO
// --------------------------------------------------
const registrarUsuario = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      correo,
      password,
      telefono,
      imagen_perfil,
    } = req.body;

    if (
      !nombre ||
      !apellido ||
      !correo ||
      !password ||
      !telefono
    ) {
      return res.status(400).json({
        error:
          "Por favor completa todos los campos obligatorios.",
      });
    }

    const [existingUser] = await db.query(
      "SELECT id_usuario FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        error:
          "El correo electrónico ya está registrado.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    /*
      Todo usuario que se registra normalmente
      desde la aplicación será Paciente.
    */
    const rol = "Paciente";
    const estado = "Activo";

    const [resultado] = await db.query(
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
        nombre,
        apellido,
        correo,
        hashedPassword,
        telefono,
        rol,
        estado,
        imagen_perfil || null,
      ]
    );

    return res.status(201).json({
      mensaje:
        "¡Usuario registrado exitosamente!",
      usuario: {
        id_usuario: resultado.insertId,
        nombre,
        apellido,
        correo,
        telefono,
        rol,
        estado,
        imagen_perfil:
          imagen_perfil || null,
      },
    });
  } catch (error) {
    console.error(
      "Error en el registro:",
      error
    );

    return res.status(500).json({
      error:
        "Error interno del servidor al registrar el usuario.",
    });
  }
};

// --------------------------------------------------
// LOGIN
// --------------------------------------------------
const loginUsuario = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        error:
          "Por favor ingresa el correo y la contraseña.",
      });
    }

    const [usuarios] = await db.query(
      `SELECT *
       FROM usuarios
       WHERE correo = ?
       LIMIT 1`,
      [correo]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({
        error:
          "Correo o contraseña incorrectos.",
      });
    }

    const usuario = usuarios[0];

    const passwordMatch =
      await bcrypt.compare(
        password,
        usuario.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        error:
          "Correo o contraseña incorrectos.",
      });
    }

    if (
      usuario.estado?.toLowerCase() !==
      "activo"
    ) {
      return res.status(403).json({
        error:
          "El usuario se encuentra inactivo.",
      });
    }

    return res.status(200).json({
      mensaje: "Login exitoso",
      usuario: {
        id_usuario:
          usuario.id_usuario,
        nombre:
          usuario.nombre,
        apellido:
          usuario.apellido,
        correo:
          usuario.correo,
        telefono:
          usuario.telefono,
        rol:
          usuario.rol,
        estado:
          usuario.estado,
        imagen_perfil:
          usuario.imagen_perfil || null,
      },
    });
  } catch (error) {
    console.error(
      "Error en el login:",
      error
    );

    return res.status(500).json({
      error:
        "Error interno del servidor al iniciar sesión.",
    });
  }
};

// --------------------------------------------------
// ACTUALIZAR DATOS PERSONALES
// --------------------------------------------------
const actualizarPerfil = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      apellido,
      correo,
      telefono,
    } = req.body;

    if (
      !nombre ||
      !apellido ||
      !correo ||
      !telefono
    ) {
      return res.status(400).json({
        error:
          "Por favor completa todos los campos obligatorios.",
      });
    }

    const [usuarios] = await db.query(
      `SELECT id_usuario
       FROM usuarios
       WHERE id_usuario = ?`,
      [id]
    );

    if (usuarios.length === 0) {
      return res.status(404).json({
        error:
          "No se encontró el usuario.",
      });
    }

    const [correoExistente] =
      await db.query(
        `SELECT id_usuario
         FROM usuarios
         WHERE correo = ?
         AND id_usuario != ?`,
        [correo, id]
      );

    if (
      correoExistente.length > 0
    ) {
      return res.status(400).json({
        error:
          "El correo electrónico ya está registrado.",
      });
    }

    await db.query(
      `UPDATE usuarios
       SET
         nombre = ?,
         apellido = ?,
         correo = ?,
         telefono = ?
       WHERE id_usuario = ?`,
      [
        nombre,
        apellido,
        correo,
        telefono,
        id,
      ]
    );

    return res.status(200).json({
      mensaje:
        "Perfil actualizado exitosamente.",
      usuario: {
        id_usuario:
          Number(id),
        nombre,
        apellido,
        correo,
        telefono,
      },
    });
  } catch (error) {
    console.error(
      "Error al actualizar el perfil:",
      error
    );

    return res.status(500).json({
      error:
        "Error interno del servidor al actualizar el perfil.",
    });
  }
};

// --------------------------------------------------
// ACTUALIZAR IMAGEN DE PERFIL
// --------------------------------------------------
const actualizarImagenPerfil =
  async (req, res) => {
    try {
      const { id } = req.params;
      const { imagen_perfil } =
        req.body;

      if (!imagen_perfil) {
        return res.status(400).json({
          error:
            "No se proporcionó una imagen de perfil.",
        });
      }

      const [usuarios] =
        await db.query(
          `SELECT id_usuario
           FROM usuarios
           WHERE id_usuario = ?`,
          [id]
        );

      if (
        usuarios.length === 0
      ) {
        return res.status(404).json({
          error:
            "No se encontró el usuario.",
        });
      }

      await db.query(
        `UPDATE usuarios
         SET imagen_perfil = ?
         WHERE id_usuario = ?`,
        [
          imagen_perfil,
          id,
        ]
      );

      return res.status(200).json({
        mensaje:
          "Fotografía actualizada correctamente.",
        imagen_perfil,
      });
    } catch (error) {
      console.error(
        "Error al actualizar imagen de perfil:",
        error
      );

      return res.status(500).json({
        error:
          "Error interno del servidor al actualizar la fotografía.",
      });
    }
  };

// --------------------------------------------------
// CAMBIAR CONTRASEÑA
// --------------------------------------------------
const cambiarContrasena =
  async (req, res) => {
    try {
      const { id } = req.params;

      const {
        contrasenaActual,
        contrasenaNueva,
      } = req.body;

      if (
        !contrasenaActual ||
        !contrasenaNueva
      ) {
        return res.status(400).json({
          error:
            "Completa todos los campos obligatorios.",
        });
      }

      if (
        contrasenaNueva.length < 8
      ) {
        return res.status(400).json({
          error:
            "La nueva contraseña debe tener al menos 8 caracteres.",
        });
      }

      const [usuarios] =
        await db.query(
          `SELECT
            id_usuario,
            password
           FROM usuarios
           WHERE id_usuario = ?`,
          [id]
        );

      if (
        usuarios.length === 0
      ) {
        return res.status(404).json({
          error:
            "No se encontró el usuario.",
        });
      }

      const usuario =
        usuarios[0];

      const contrasenaCorrecta =
        await bcrypt.compare(
          contrasenaActual,
          usuario.password
        );

      if (
        !contrasenaCorrecta
      ) {
        return res.status(401).json({
          error:
            "La contraseña actual es incorrecta.",
        });
      }

      const nuevoHash =
        await bcrypt.hash(
          contrasenaNueva,
          10
        );

      await db.query(
        `UPDATE usuarios
         SET password = ?
         WHERE id_usuario = ?`,
        [
          nuevoHash,
          id,
        ]
      );

      return res.status(200).json({
        mensaje:
          "La contraseña se actualizó correctamente.",
      });
    } catch (error) {
      console.error(
        "Error al cambiar la contraseña:",
        error
      );

      return res.status(500).json({
        error:
          "Error interno del servidor al cambiar la contraseña.",
      });
    }
  };

// --------------------------------------------------
// EXPORTAR CONTROLADORES
// --------------------------------------------------
module.exports = {
  registrarUsuario,
  loginUsuario,
  actualizarPerfil,
  actualizarImagenPerfil,
  cambiarContrasena,
};