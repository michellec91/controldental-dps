const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// -----------------------------------------
// CORS
// -----------------------------------------
const originsPermitidos = [
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permite solicitudes sin origin,
      // por ejemplo Postman o algunas apps móviles.
      if (!origin) {
        return callback(null, true);
      }

      if (originsPermitidos.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `Origen no permitido por CORS: ${origin}`
        )
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

// -----------------------------------------
// JSON
// -----------------------------------------
app.use(express.json());

// -----------------------------------------
// RUTAS
// -----------------------------------------
const usuariosRoutes = require("./routes/usuarios.routes");
const tratamientosRoutes = require("./routes/tratamientos.routes");
const citasRoutes = require("./routes/citas.routes");
const horariosRoutes = require("./routes/horarios.routes");

console.log(
  "usuariosRoutes:",
  typeof usuariosRoutes
);

console.log(
  "tratamientosRoutes:",
  typeof tratamientosRoutes
);

console.log(
  "citasRoutes:",
  typeof citasRoutes
);

console.log(
  "horariosRoutes:",
  typeof horariosRoutes
);

app.use(
  "/usuarios",
  usuariosRoutes
);

app.use(
  "/tratamientos",
  tratamientosRoutes
);

app.use(
  "/citas",
  citasRoutes
);

app.use(
  "/horarios",
  horariosRoutes
);

// -----------------------------------------
// RUTA DE PRUEBA
// -----------------------------------------
app.get("/", (req, res) => {
  return res.status(200).json({
    mensaje:
      "API de Control Dental funcionando",
  });
});

// -----------------------------------------
// RUTAS NO ENCONTRADAS
// -----------------------------------------
app.use((req, res) => {
  return res.status(404).json({
    error:
      "Ruta no encontrada.",
  });
});

// -----------------------------------------
// MANEJO GENERAL DE ERRORES
// -----------------------------------------
app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Error general de la API:",
      error
    );

    return res.status(500).json({
      error:
        "Error interno del servidor.",
    });
  }
);

// -----------------------------------------
// SERVIDOR
// -----------------------------------------
const PORT =
  process.env.PORT ||
  3000;

app.listen(PORT, () => {
  console.log(
    `API de Control Dental ejecutándose en http://localhost:${PORT}`
  );
});