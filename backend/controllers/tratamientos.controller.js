const db = require("../config/db");

// OBTENER TODOS LOS TRATAMIENTOS ACTIVOS
const obtenerTratamientos = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM tratamientos WHERE estado = 'activo'"
    );

    res.json(rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener tratamientos",
    });
  }
};


// OBTENER TRATAMIENTO POR ID
const obtenerTratamientoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM tratamientos WHERE id_tratamiento = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        mensaje: "Tratamiento no encontrado",
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener tratamiento",
    });
  }
};


// CREAR TRATAMIENTO
const crearTratamiento = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      duracion,
      estado,
      imagen,
    } = req.body;

    if (!nombre || !descripcion || !precio || !duracion) {
      return res.status(400).json({
        mensaje: "Faltan campos obligatorios",
      });
    }

    const [resultado] = await db.query(
      `INSERT INTO tratamientos
       (nombre, descripcion, precio, duracion, estado, imagen)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        descripcion,
        precio,
        duracion,
        estado || "activo",
        imagen || null,
      ]
    );

    res.status(201).json({
      mensaje: "Tratamiento creado correctamente",
      id_tratamiento: resultado.insertId,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al crear tratamiento",
    });
  }
};


// ACTUALIZAR TRATAMIENTO
const actualizarTratamiento = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nombre,
      descripcion,
      precio,
      duracion,
      estado,
      imagen,
    } = req.body;

    const [resultado] = await db.query(
      `UPDATE tratamientos
       SET nombre = ?,
           descripcion = ?,
           precio = ?,
           duracion = ?,
           estado = ?,
           imagen = ?
       WHERE id_tratamiento = ?`,
      [
        nombre,
        descripcion,
        precio,
        duracion,
        estado,
        imagen || null,
        id,
      ]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Tratamiento no encontrado",
      });
    }

    res.json({
      mensaje: "Tratamiento actualizado correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al actualizar tratamiento",
    });
  }
};


// ELIMINAR TRATAMIENTO
const eliminarTratamiento = async (req, res) => {
  try {
    const { id } = req.params;

    const [resultado] = await db.query(
      "DELETE FROM tratamientos WHERE id_tratamiento = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Tratamiento no encontrado",
      });
    }

    res.json({
      mensaje: "Tratamiento eliminado correctamente",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al eliminar tratamiento",
    });
  }
};


module.exports = {
  obtenerTratamientos,
  obtenerTratamientoPorId,
  crearTratamiento,
  actualizarTratamiento,
  eliminarTratamiento,
};