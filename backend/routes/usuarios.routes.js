const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const { randomBytes } = require("node:crypto");
const { getApps, initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const {
  registrarUsuario,
  loginUsuario,
  actualizarPerfil,
  actualizarImagenPerfil,
  cambiarContrasena,
} = require("../controllers/usuarios.controller");

// Vincula la identidad comprobada por Firebase con el ID numérico
// que esperan citas, historial y perfil en MySQL.
if (!getApps().length) {
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "controldental-dps",
  });
}

router.post("/firebase-sync", async (req, res) => {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!token) {
    return res.status(401).json({ error: "Falta el token de Firebase." });
  }

  let identidad;
  try {
    identidad = await getAuth().verifyIdToken(token);
  } catch (error) {
    return res.status(401).json({ error: "La sesión de Firebase no es válida." });
  }

  const uid = identidad.uid;
  const correo = (identidad.email || "").trim().toLowerCase();
  if (!correo) {
    return res.status(400).json({ error: "La cuenta de Firebase no tiene correo." });
  }

  const nombre = String(req.body?.nombre || "Paciente").trim().slice(0, 100) || "Paciente";
  const apellido = String(req.body?.apellido || "").trim().slice(0, 100) || "Sin apellido";
  const telefono = String(req.body?.telefono || "").trim().slice(0, 50);

  try {
    const [vinculos] = await db.query(
      `SELECT u.id_usuario
       FROM usuarios_firebase f
       INNER JOIN usuarios u ON u.id_usuario = f.id_usuario
       WHERE f.firebase_uid = ?`,
      [uid]
    );
    if (vinculos.length) {
      // Actualiza datos de perfil cuando Firebase ya tiene nombre real.
      if (nombre !== "Paciente") {
        await db.query(
          `UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ?
           WHERE id_usuario = ?`,
          [nombre, apellido, telefono, vinculos[0].id_usuario]
        );
      }
      return res.json({ id_usuario: vinculos[0].id_usuario });
    }

    const [existentes] = await db.query(
      "SELECT id_usuario FROM usuarios WHERE correo = ?",
      [correo]
    );
    if (existentes.length) {
      // No vincular por correo solamente: podría pertenecer a otra cuenta.
      return res.status(409).json({
        error: "Este correo ya existe en MySQL. Necesita vinculación manual.",
      });
    }

    // La contraseña de Firebase NUNCA se guarda ni se reutiliza en MySQL.
    const password = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
    const conexion = await db.getConnection();
    try {
      await conexion.beginTransaction();
      const [resultado] = await conexion.query(
        `INSERT INTO usuarios
         (nombre, apellido, correo, password, telefono, rol, estado)
         VALUES (?, ?, ?, ?, ?, 'Paciente', 'Activo')`,
        [nombre, apellido, correo, password, telefono]
      );
      await conexion.query(
        "INSERT INTO usuarios_firebase (firebase_uid, id_usuario) VALUES (?, ?)",
        [uid, resultado.insertId]
      );
      await conexion.commit();
      return res.status(201).json({ id_usuario: resultado.insertId });
    } catch (error) {
      await conexion.rollback();
      if (error.code === "ER_DUP_ENTRY") {
        const [vinculosLuego] = await db.query(
          "SELECT id_usuario FROM usuarios_firebase WHERE firebase_uid = ?",
          [uid]
        );
        if (vinculosLuego.length) {
          return res.json({ id_usuario: vinculosLuego[0].id_usuario });
        }
        return res.status(409).json({
          error: "Este correo ya está vinculado a otra cuenta en MySQL.",
        });
      }
      throw error;
    } finally {
      conexion.release();
    }
  } catch (error) {
    console.error("Error al vincular Firebase y MySQL:", error);
    return res.status(500).json({ error: "No se pudo vincular la cuenta con MySQL." });
  }
});

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