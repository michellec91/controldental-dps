const express = require("express");

const router = express.Router();

const {
  obtenerTratamientos,
  obtenerTratamientoPorId,
  crearTratamiento,
  actualizarTratamiento,
  eliminarTratamiento,
} = require("../controllers/tratamientos.controller");

router.get("/", obtenerTratamientos);

router.get("/:id", obtenerTratamientoPorId);

router.post("/", crearTratamiento);

router.put("/:id", actualizarTratamiento);

router.delete("/:id", eliminarTratamiento);

module.exports = router;