async function seedTratamientos(connection) {
  const tratamientos = [
    {
      nombre: "Evaluación/Consulta Dental",
      descripcion:
        "Revisión general de dientes y encías para conocer el estado de la salud bucal y recomendar el tratamiento adecuado.",
      precio: 20.0,
      duracion: 30,
      estado: "activo",
    },
    {
      nombre: "Limpieza dental básica",
      descripcion:
        "Eliminación de placa, sarro leve y manchas superficiales para mantener una adecuada higiene bucal.",
      precio: 25.0,
      duracion: 45,
      estado: "activo",
    },
    {
      nombre: "Limpieza dental profunda",
      descripcion:
        "Limpieza especializada para eliminar acumulaciones de placa y sarro debajo de la línea de las encías.",
      precio: 40.0,
      duracion: 60,
      estado: "activo",
    },
    {
      nombre: "Relleno de resina",
      descripcion:
        "Restauración del diente mediante resina para reparar daños ocasionados principalmente por caries.",
      precio: 35.0,
      duracion: 45,
      estado: "activo",
    },
    {
      nombre: "Reconstrucción Dental",
      descripcion:
        "Restauración de una pieza dental que ha sufrido una pérdida considerable de su estructura.",
      precio: 50.0,
      duracion: 60,
      estado: "activo",
    },
    {
      nombre: "Extracción dental simple",
      descripcion:
        "Retiro de una pieza dental que no requiere un procedimiento quirúrgico complejo.",
      precio: 50.0,
      duracion: 45,
      estado: "activo",
    },
    {
      nombre: "Extracción de cordal",
      descripcion:
        "Procedimiento para retirar una muela del juicio cuando su extracción es necesaria.",
      precio: 130.0,
      duracion: 90,
      estado: "activo",
    },
    {
      nombre: "Endodoncia",
      descripcion:
        "Tratamiento del interior del diente para eliminar tejido afectado y ayudar a conservar la pieza dental.",
      precio: 200.0,
      duracion: 90,
      estado: "activo",
    },
    {
      nombre: "Blanqueamiento Dental",
      descripcion:
        "Tratamiento estético para aclarar el tono de los dientes y mejorar la apariencia de la sonrisa.",
      precio: 100.0,
      duracion: 90,
      estado: "activo",
    },
  ];

  for (const tratamiento of tratamientos) {
    const [existente] = await connection.query(
      "SELECT id_tratamiento FROM tratamientos WHERE nombre = ? LIMIT 1",
      [tratamiento.nombre]
    );

    if (existente.length > 0) {
      console.log(
        `Tratamiento ya existe, se omite: ${tratamiento.nombre}`
      );
      continue;
    }

    await connection.query(
      `INSERT INTO tratamientos
       (nombre, descripcion, precio, duracion, estado, imagen)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        tratamiento.nombre,
        tratamiento.descripcion,
        tratamiento.precio,
        tratamiento.duracion,
        tratamiento.estado,
        null,
      ]
    );

    console.log(
      `Tratamiento creado: ${tratamiento.nombre}`
    );
  }
}

module.exports = seedTratamientos;