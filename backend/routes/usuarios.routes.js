const express = require("express");
const router = express.Router();
const db = require("../config/db");

const {
  registrarUsuario,
  loginUsuario,
  actualizarPerfil,
  actualizarImagenPerfil,
  cambiarContrasena,
} = require("../controllers/usuarios.controller");

// --------------------------------------------------
// OBTENER TODOS LOS USUARIOS
// --------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const [rows] =
      await db.query(
        `SELECT
          id_usuario,
          nombre,
          apellido,
          correo,
          telefono,
          rol,
          estado,
          imagen_perfil,
          fecha_creacion
         FROM usuarios`
      );

    return res.json(rows);
  } catch (error) {
    console.error(
      "Error al obtener usuarios:",
      error
    );

    return res.status(500).json({
      error:
        "Error al obtener usuarios.",
    });
  }
});

// --------------------------------------------------
// OBTENER USUARIO POR ID
// --------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const { id } =
      req.params;

    const [rows] =
      await db.query(
        `SELECT
          id_usuario,
          nombre,
          apellido,
          correo,
          telefono,
          rol,
          estado,
          imagen_perfil,
          fecha_creacion
         FROM usuarios
         WHERE id_usuario = ?`,
        [id]
      );

    if (
      rows.length === 0
    ) {
      return res.status(404).json({
        error:
          "Usuario no encontrado.",
      });
    }

    return res.json(
      rows[0]
    );
  } catch (error) {
    console.error(
      "Error al obtener usuario:",
      error
    );

    return res.status(500).json({
      error:
        "Error al obtener el usuario.",
    });
  }
});

// --------------------------------------------------
// AUTENTICACIÓN
// --------------------------------------------------
router.post(
  "/register",
  registrarUsuario
);

router.post(
  "/login",
  loginUsuario
);

// --------------------------------------------------
// PERFIL
// --------------------------------------------------
router.put(
  "/:id",
  actualizarPerfil
);

// --------------------------------------------------
// IMAGEN DE PERFIL
// --------------------------------------------------
router.put(
  "/:id/imagen-perfil",
  actualizarImagenPerfil
);

// --------------------------------------------------
// CONTRASEÑA
// --------------------------------------------------
router.put(
  "/:id/change-password",
  cambiarContrasena
);

module.exports = router;