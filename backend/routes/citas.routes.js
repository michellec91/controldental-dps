const express =
  require("express");

const router =
  express.Router();

const {
  obtenerCitas,
  crearCita,
  actualizarCita,
  actualizarEstadoCita,
  cancelarCita,
} = require(
  "../controllers/citas.controller"
);

// Obtener todas las citas
// También permite:
// /citas?id_usuario=2
// /citas?estado=Pendiente
router.get(
  "/",
  obtenerCitas
);

// Crear cita
router.post(
  "/",
  crearCita
);

// Actualizar solo el estado
router.patch(
  "/:id/estado",
  actualizarEstadoCita
);

// Actualizar cita completa
router.put(
  "/:id",
  actualizarCita
);

// Cancelar cita
router.delete(
  "/:id",
  cancelarCita
);

module.exports = router;