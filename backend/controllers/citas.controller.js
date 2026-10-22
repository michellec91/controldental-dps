const db = require("../config/db");

// -----------------------------------------
// OBTENER CITAS
// GET /citas
// GET /citas?id_usuario=2
// GET /citas?estado=Pendiente
// -----------------------------------------
const obtenerCitas = async (req, res) => {
  try {
    const { id_usuario, estado } = req.query;

    let sql = `
      SELECT
        c.id_cita,
        c.id_usuario,
        u.nombre AS paciente_nombre,
        u.apellido AS paciente_apellido,
        u.correo,
        u.telefono,

        c.id_tratamiento,
        t.nombre AS tratamiento_nombre,

        c.fecha,
        c.hora,
        c.estado,
        c.fecha_creacion

      FROM citas c

      INNER JOIN usuarios u
        ON c.id_usuario = u.id_usuario

      INNER JOIN tratamientos t
        ON c.id_tratamiento = t.id_tratamiento
    `;

    const condiciones = [];
    const params = [];

    if (id_usuario) {
      condiciones.push(
        "c.id_usuario = ?"
      );

      params.push(
        id_usuario
      );
    }

    if (estado) {
      condiciones.push(
        "LOWER(c.estado) = LOWER(?)"
      );

      params.push(
        estado
      );
    }

    if (
      condiciones.length > 0
    ) {
      sql += ` WHERE ${condiciones.join(
        " AND "
      )}`;
    }

    sql += `
      ORDER BY
        c.fecha ASC,
        c.hora ASC
    `;

    const [rows] =
      await db.query(
        sql,
        params
      );

    return res
      .status(200)
      .json(rows);
  } catch (error) {
    console.error(
      "Error al obtener citas:",
      error
    );

    return res
      .status(500)
      .json({
        error:
          "Error interno del servidor al obtener las citas.",
      });
  }
};

// -----------------------------------------
// CREAR CITA
// POST /citas
// -----------------------------------------
const crearCita = async (
  req,
  res
) => {
  try {
    const {
      id_usuario,
      id_tratamiento,
      fecha,
      hora,
      estado,
    } = req.body;

    if (
      !id_usuario ||
      !id_tratamiento ||
      !fecha ||
      !hora
    ) {
      return res
        .status(400)
        .json({
          error:
            "Usuario, tratamiento, fecha y hora son obligatorios.",
        });
    }

    // -----------------------------------------
    // ESTADO INICIAL
    // -----------------------------------------
    // Web administrativa:
    // envía "Confirmada"
    //
    // App móvil:
    // puede no enviar estado
    // y queda como "Pendiente"
    const estadoFinal =
      estado === "Confirmada"
        ? "Confirmada"
        : "Pendiente";

    // -----------------------------------------
    // VERIFICAR USUARIO
    // -----------------------------------------
    const [usuarios] =
      await db.query(
        `SELECT
          id_usuario
         FROM usuarios
         WHERE id_usuario = ?
         AND LOWER(estado) = 'activo'`,
        [id_usuario]
      );

    if (
      usuarios.length === 0
    ) {
      return res
        .status(404)
        .json({
          error:
            "El usuario no existe o está inactivo.",
        });
    }

    // -----------------------------------------
    // VERIFICAR TRATAMIENTO
    // -----------------------------------------
    const [tratamientos] =
      await db.query(
        `SELECT
          id_tratamiento
         FROM tratamientos
         WHERE id_tratamiento = ?
         AND LOWER(estado) = 'activo'`,
        [
          id_tratamiento,
        ]
      );

    if (
      tratamientos.length ===
      0
    ) {
      return res
        .status(404)
        .json({
          error:
            "El tratamiento no existe o está inactivo.",
        });
    }

    // -----------------------------------------
    // VALIDAR HORARIO OCUPADO
    // -----------------------------------------
    const [existentes] =
      await db.query(
        `SELECT
          id_cita
         FROM citas
         WHERE fecha = ?
         AND hora = ?
         AND LOWER(estado) != 'cancelada'`,
        [
          fecha,
          hora,
        ]
      );

    if (
      existentes.length > 0
    ) {
      return res
        .status(400)
        .json({
          error:
            "Ese horario ya está ocupado. Selecciona otra fecha u hora.",
        });
    }

    // -----------------------------------------
    // INSERTAR CITA
    // -----------------------------------------
    const [result] =
      await db.query(
        `INSERT INTO citas
        (
          id_usuario,
          id_tratamiento,
          fecha,
          hora,
          estado
        )
        VALUES (?, ?, ?, ?, ?)`,
        [
          id_usuario,
          id_tratamiento,
          fecha,
          hora,
          estadoFinal,
        ]
      );

    return res
      .status(201)
      .json({
        mensaje:
          "Cita creada correctamente.",
        cita: {
          id_cita:
            result.insertId,
          id_usuario,
          id_tratamiento,
          fecha,
          hora,
          estado:
            estadoFinal,
        },
      });
  } catch (error) {
    console.error(
      "Error al crear cita:",
      error
    );

    return res
      .status(500)
      .json({
        error:
          "Error interno del servidor al crear la cita.",
      });
  }
};

// -----------------------------------------
// ACTUALIZAR CITA COMPLETA
// PUT /citas/:id
// -----------------------------------------
const actualizarCita =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        id_tratamiento,
        fecha,
        hora,
        estado,
      } = req.body;

      if (
        !id_tratamiento ||
        !fecha ||
        !hora ||
        !estado
      ) {
        return res
          .status(400)
          .json({
            error:
              "Tratamiento, fecha, hora y estado son obligatorios.",
          });
      }

      const [citas] =
        await db.query(
          `SELECT
            id_cita
           FROM citas
           WHERE id_cita = ?`,
          [id]
        );

      if (
        citas.length === 0
      ) {
        return res
          .status(404)
          .json({
            error:
              "Cita no encontrada.",
          });
      }

      const [
        tratamientos,
      ] =
        await db.query(
          `SELECT
            id_tratamiento
           FROM tratamientos
           WHERE id_tratamiento = ?
           AND LOWER(estado) = 'activo'`,
          [
            id_tratamiento,
          ]
        );

      if (
        tratamientos.length ===
        0
      ) {
        return res
          .status(404)
          .json({
            error:
              "El tratamiento no existe o está inactivo.",
          });
      }

      const [existentes] =
        await db.query(
          `SELECT
            id_cita
           FROM citas
           WHERE fecha = ?
           AND hora = ?
           AND id_cita != ?
           AND LOWER(estado) != 'cancelada'`,
          [
            fecha,
            hora,
            id,
          ]
        );

      if (
        existentes.length > 0
      ) {
        return res
          .status(400)
          .json({
            error:
              "Ese horario ya está ocupado. Selecciona otra fecha u hora.",
          });
      }

      await db.query(
        `UPDATE citas
         SET
           id_tratamiento = ?,
           fecha = ?,
           hora = ?,
           estado = ?
         WHERE id_cita = ?`,
        [
          id_tratamiento,
          fecha,
          hora,
          estado,
          id,
        ]
      );

      return res
        .status(200)
        .json({
          mensaje:
            "Cita actualizada correctamente.",
        });
    } catch (error) {
      console.error(
        "Error al actualizar cita:",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Error interno del servidor al actualizar la cita.",
        });
    }
  };

// -----------------------------------------
// ACTUALIZAR SOLO ESTADO
// PATCH /citas/:id/estado
// -----------------------------------------
const actualizarEstadoCita =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const { estado } =
        req.body;

      const estadosPermitidos =
        [
          "Pendiente",
          "Confirmada",
          "Cancelada",
          "Completada",
        ];

      if (
        !estado ||
        !estadosPermitidos.includes(
          estado
        )
      ) {
        return res
          .status(400)
          .json({
            error:
              "Estado no válido.",
          });
      }

      const [citas] =
        await db.query(
          `SELECT
            id_cita
           FROM citas
           WHERE id_cita = ?`,
          [id]
        );

      if (
        citas.length === 0
      ) {
        return res
          .status(404)
          .json({
            error:
              "Cita no encontrada.",
          });
      }

      await db.query(
        `UPDATE citas
         SET estado = ?
         WHERE id_cita = ?`,
        [
          estado,
          id,
        ]
      );

      const [actualizada] =
        await db.query(
          `SELECT
            c.id_cita,
            c.id_usuario,
            u.nombre AS paciente_nombre,
            u.apellido AS paciente_apellido,
            u.correo,
            u.telefono,

            c.id_tratamiento,
            t.nombre AS tratamiento_nombre,

            c.fecha,
            c.hora,
            c.estado,
            c.fecha_creacion

           FROM citas c

           INNER JOIN usuarios u
             ON c.id_usuario = u.id_usuario

           INNER JOIN tratamientos t
             ON c.id_tratamiento = t.id_tratamiento

           WHERE c.id_cita = ?`,
          [id]
        );

      return res
        .status(200)
        .json({
          mensaje:
            "Estado actualizado correctamente.",
          cita:
            actualizada[0],
        });
    } catch (error) {
      console.error(
        "Error al actualizar estado:",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Error interno del servidor al actualizar el estado.",
        });
    }
  };

// -----------------------------------------
// CANCELAR CITA
// DELETE /citas/:id
// -----------------------------------------
const cancelarCita =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const [citas] =
        await db.query(
          `SELECT
            id_cita
           FROM citas
           WHERE id_cita = ?`,
          [id]
        );

      if (
        citas.length === 0
      ) {
        return res
          .status(404)
          .json({
            error:
              "Cita no encontrada.",
          });
      }

      // No se elimina físicamente.
      // Se conserva en el historial.
      await db.query(
        `UPDATE citas
         SET estado = 'Cancelada'
         WHERE id_cita = ?`,
        [id]
      );

      return res
        .status(200)
        .json({
          mensaje:
            "Cita cancelada correctamente.",
        });
    } catch (error) {
      console.error(
        "Error al cancelar cita:",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Error interno del servidor al cancelar la cita.",
        });
    }
  };

module.exports = {
  obtenerCitas,
  crearCita,
  actualizarCita,
  actualizarEstadoCita,
  cancelarCita,
};