const express = require("express");
const router = express.Router();

const {
  obtenerHorarios,
  obtenerHorarioPorId,
  crearHorario,
  actualizarHorario,
  eliminarHorario,
} = require("../controllers/horarios.controller");

// -----------------------------------------
// OBTENER TODOS LOS HORARIOS
// -----------------------------------------
router.get(
  "/",
  obtenerHorarios
);

// -----------------------------------------
// OBTENER HORARIO POR ID
// -----------------------------------------
router.get(
  "/:id",
  obtenerHorarioPorId
);

// -----------------------------------------
// CREAR HORARIO
// -----------------------------------------
router.post(
  "/",
  crearHorario
);

// -----------------------------------------
// ACTUALIZAR HORARIO
// -----------------------------------------
router.put(
  "/:id",
  actualizarHorario
);

// -----------------------------------------
// DESACTIVAR HORARIO
// -----------------------------------------
router.delete(
  "/:id",
  eliminarHorario
);

module.exports = router;