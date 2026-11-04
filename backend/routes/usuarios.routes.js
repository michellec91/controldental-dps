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

  // Verificar token de Firebase
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";

  if (!token) {
    return res.status(401).json({
      error: "Falta el token de Firebase.",
    });
  }

  let identidad;

  try {
    identidad = await getAuth().verifyIdToken(token);
  } catch (error) {
    return res.status(401).json({
      error: "La sesión de Firebase no es válida.",
    });
  }

  const uid = identidad.uid;
  const correo = String(identidad.email || "")
    .trim()
    .toLowerCase();

  if (!correo) {
    return res.status(400).json({
      error: "La cuenta de Firebase no tiene correo.",
    });
  }

  // Datos enviados por el formulario
  const completarPerfil = req.body?.completarPerfil === true;

  const nombre = String(req.body?.nombre ?? "").trim();
  const apellido = String(req.body?.apellido ?? "").trim();
  const telefono = String(req.body?.telefono ?? "").trim();

  // Validar campos obligatorios
  const datosValidos =
    nombre.length > 0 &&
    nombre.length <= 100 &&
    apellido.length > 0 &&
    apellido.length <= 100 &&
    telefono.length > 0 &&
    telefono.length <= 50 &&
    nombre.toLowerCase() !== "paciente" &&
    apellido.toLowerCase() !== "sin apellido" &&
    /^[0-9+\s()-]+$/.test(telefono);

  // Comprobar perfil guardado
  const perfilCompleto = (usuario) =>
    Boolean(
      usuario.nombre?.trim() &&
      usuario.nombre.trim().toLowerCase() !== "paciente" &&
      usuario.apellido?.trim() &&
      usuario.apellido.trim().toLowerCase() !== "sin apellido" &&
      usuario.telefono?.trim()
    );

  try {

    // Buscar usuario mediante UID Firebase
    const [vinculos] = await db.query(
      `SELECT
        u.id_usuario,
        u.nombre,
        u.apellido,
        u.correo,
        u.telefono,
        u.rol,
        u.estado,
        u.imagen_perfil
       FROM usuarios_firebase f
       INNER JOIN usuarios u
       ON u.id_usuario = f.id_usuario
       WHERE f.firebase_uid = ?`,
      [uid]
    );

    // --------------------------------------------------
    // USUARIO EXISTENTE
    // --------------------------------------------------
    if (vinculos.length > 0) {

      let usuario = vinculos[0];

      if (String(usuario.estado).toLowerCase() !== "activo") {
        return res.status(403).json({
          error: "La cuenta no está activa.",
        });
      }

      // Actualizar solamente al confirmar formulario
      if (completarPerfil) {

        if (!datosValidos) {
          return res.status(422).json({
            requiereRegistro: true,
            error: "Completa nombre, apellido y teléfono correctamente.",
          });
        }

        await db.query(
          `UPDATE usuarios
           SET nombre = ?, apellido = ?, telefono = ?
           WHERE id_usuario = ?`,
          [
            nombre,
            apellido,
            telefono,
            usuario.id_usuario,
          ]
        );

        usuario = {
          ...usuario,
          nombre,
          apellido,
          telefono,
        };
      }

      // Comprobar si faltan datos
      if (!perfilCompleto(usuario)) {
        return res.status(422).json({
          requiereRegistro: true,
          error: "Debes completar tu registro.",
          perfil: usuario,
        });
      }

      return res.status(200).json({
        registrado: true,
        requiereRegistro: false,
        id_usuario: usuario.id_usuario,
        perfil: usuario,
      });
    }

    // --------------------------------------------------
    // COMPROBAR CORREO EXISTENTE
    // --------------------------------------------------
    const [existentes] = await db.query(
      "SELECT id_usuario FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (existentes.length > 0) {
      return res.status(409).json({
        error: "Este correo ya existe en MySQL. Necesita vinculación manual.",
      });
    }

    // --------------------------------------------------
    // USUARIO NUEVO: EXIGIR REGISTRO
    // --------------------------------------------------
    if (!completarPerfil || !datosValidos) {
      return res.status(422).json({
        requiereRegistro: true,
        error: "Completa tu registro antes de continuar.",
      });
    }

    // Contraseña aleatoria para satisfacer el esquema
    // MySQL. No se guarda contraseña de Google.
    const password = await bcrypt.hash(
      randomBytes(32).toString("hex"),
      10
    );

    const conexion = await db.getConnection();

    try {
      await conexion.beginTransaction();

      // Registrar paciente
      const [resultado] = await conexion.query(
        `INSERT INTO usuarios
         (
           nombre,
           apellido,
           correo,
           password,
           telefono,
           rol,
           estado
         )
         VALUES (?, ?, ?, ?, ?, 'Paciente', 'Activo')`,
        [
          nombre,
          apellido,
          correo,
          password,
          telefono
        ]
      );

      // Vincular Firebase UID con MySQL
      await conexion.query(
        `INSERT INTO usuarios_firebase
         (firebase_uid, id_usuario)
         VALUES (?, ?)`,
        [uid, resultado.insertId]
      );

      await conexion.commit();

      return res.status(201).json({
        registrado: true,
        requiereRegistro: false,
        id_usuario: resultado.insertId,
        perfil: {
          id_usuario: resultado.insertId,
          nombre,
          apellido,
          correo,
          telefono,
          rol: "Paciente",
          estado: "Activo",
          imagen_perfil: null,
        },
      });

    } catch (error) {

      await conexion.rollback();

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          error: "La cuenta ya existe. Vuelve a iniciar sesión.",
        });
      }

      throw error;

    } finally {
      conexion.release();
    }

  } catch (error) {

    console.error("Error al vincular Firebase y MySQL:", error);

    return res.status(500).json({
      error: "No se pudo vincular la cuenta con MySQL.",
    });
  }
});

// --------------------------------------------------
// OBTENER TODOS LOS USUARIOS
// --------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
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
    console.error("Error al obtener usuarios:", error);

    return res.status(500).json({
      error: "Error al obtener usuarios.",
    });
  }
});

// --------------------------------------------------
// OBTENER USUARIO POR ID
// --------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
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

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Usuario no encontrado.",
      });
    }

    return res.json(rows[0]);

  } catch (error) {
    console.error("Error al obtener usuario:", error);

    return res.status(500).json({
      error: "Error al obtener el usuario.",
    });
  }
});

// --------------------------------------------------
// AUTENTICACIÓN
// --------------------------------------------------
router.post("/register", registrarUsuario);

router.post("/login", loginUsuario);

// --------------------------------------------------
// PERFIL
// --------------------------------------------------
router.put("/:id", actualizarPerfil);

// --------------------------------------------------
// IMAGEN DE PERFIL
// --------------------------------------------------
router.put("/:id/imagen-perfil", actualizarImagenPerfil);

// --------------------------------------------------
// CONTRASEÑA
// --------------------------------------------------
router.put("/:id/change-password", cambiarContrasena);

module.exports = router;