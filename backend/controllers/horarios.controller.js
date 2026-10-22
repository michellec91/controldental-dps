const db = require("../config/db");

// -----------------------------------------
// OBTENER TODOS LOS HORARIOS
// -----------------------------------------
const obtenerHorarios = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
        id_horario,
        dia_semana,
        hora_inicio,
        hora_fin,
        estado
       FROM horarios
       ORDER BY FIELD(
         dia_semana,
         'Lunes',
         'Martes',
         'Miércoles',
         'Jueves',
         'Viernes',
         'Sábado',
         'Domingo'
       )`
    );

    return res.status(200).json(rows);
  } catch (error) {
    console.error(
      "Error al obtener horarios:",
      error
    );

    return res.status(500).json({
      error:
        "Error interno del servidor al obtener los horarios.",
    });
  }
};

// -----------------------------------------
// OBTENER HORARIO POR ID
// -----------------------------------------
const obtenerHorarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT
        id_horario,
        dia_semana,
        hora_inicio,
        hora_fin,
        estado
       FROM horarios
       WHERE id_horario = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Horario no encontrado.",
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error(
      "Error al obtener horario:",
      error
    );

    return res.status(500).json({
      error:
        "Error interno del servidor al obtener el horario.",
    });
  }
};

// -----------------------------------------
// CREAR HORARIO
// -----------------------------------------
const crearHorario = async (req, res) => {
  try {
    const {
      dia_semana,
      hora_inicio,
      hora_fin,
      estado,
    } = req.body;

    if (
      !dia_semana ||
      !hora_inicio ||
      !hora_fin
    ) {
      return res.status(400).json({
        error:
          "Día, hora de inicio y hora de finalización son obligatorios.",
      });
    }

    const [existente] = await db.query(
      `SELECT id_horario
       FROM horarios
       WHERE dia_semana = ?`,
      [dia_semana]
    );

    if (existente.length > 0) {
      return res.status(400).json({
        error:
          "Ya existe un horario registrado para ese día.",
      });
    }

    const [resultado] = await db.query(
      `INSERT INTO horarios
      (
        dia_semana,
        hora_inicio,
        hora_fin,
        estado
      )
      VALUES (?, ?, ?, ?)`,
      [
        dia_semana,
        hora_inicio,
        hora_fin,
        estado || "activo",
      ]
    );

    return res.status(201).json({
      mensaje:
        "Horario creado correctamente.",
      horario: {
        id_horario:
          resultado.insertId,
        dia_semana,
        hora_inicio,
        hora_fin,
        estado:
          estado || "activo",
      },
    });
  } catch (error) {
    console.error(
      "Error al crear horario:",
      error
    );

    return res.status(500).json({
      error:
        "Error interno del servidor al crear el horario.",
    });
  }
};

// -----------------------------------------
// ACTUALIZAR HORARIO
// -----------------------------------------
const actualizarHorario = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      dia_semana,
      hora_inicio,
      hora_fin,
      estado,
    } = req.body;

    if (
      !dia_semana ||
      !hora_inicio ||
      !hora_fin ||
      !estado
    ) {
      return res.status(400).json({
        error:
          "Todos los campos son obligatorios.",
      });
    }

    const [horarios] = await db.query(
      `SELECT id_horario
       FROM horarios
       WHERE id_horario = ?`,
      [id]
    );

    if (horarios.length === 0) {
      return res.status(404).json({
        error:
          "Horario no encontrado.",
      });
    }

    const [duplicado] = await db.query(
      `SELECT id_horario
       FROM horarios
       WHERE dia_semana = ?
       AND id_horario != ?`,
      [dia_semana, id]
    );

    if (duplicado.length > 0) {
      return res.status(400).json({
        error:
          "Ya existe otro horario registrado para ese día.",
      });
    }

    await db.query(
      `UPDATE horarios
       SET
         dia_semana = ?,
         hora_inicio = ?,
         hora_fin = ?,
         estado = ?
       WHERE id_horario = ?`,
      [
        dia_semana,
        hora_inicio,
        hora_fin,
        estado,
        id,
      ]
    );

    return res.status(200).json({
      mensaje:
        "Horario actualizado correctamente.",
      horario: {
        id_horario:
          Number(id),
        dia_semana,
        hora_inicio,
        hora_fin,
        estado,
      },
    });
  } catch (error) {
    console.error(
      "Error al actualizar horario:",
      error
    );

    return res.status(500).json({
      error:
        "Error interno del servidor al actualizar el horario.",
    });
  }
};

// -----------------------------------------
// DESACTIVAR HORARIO
// -----------------------------------------
const eliminarHorario = async (req, res) => {
  try {
    const { id } = req.params;

    const [horarios] = await db.query(
      `SELECT id_horario
       FROM horarios
       WHERE id_horario = ?`,
      [id]
    );

    if (horarios.length === 0) {
      return res.status(404).json({
        error:
          "Horario no encontrado.",
      });
    }

    await db.query(
      `UPDATE horarios
       SET estado = 'inactivo'
       WHERE id_horario = ?`,
      [id]
    );

    return res.status(200).json({
      mensaje:
        "Horario desactivado correctamente.",
    });
  } catch (error) {
    console.error(
      "Error al desactivar horario:",
      error
    );

    return res.status(500).json({
      error:
        "Error interno del servidor al desactivar el horario.",
    });
  }
};

module.exports = {
  obtenerHorarios,
  obtenerHorarioPorId,
  crearHorario,
  actualizarHorario,
  eliminarHorario,
};