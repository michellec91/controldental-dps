async function seedHorarios(connection) {
  const horarios = [
    {
      dia_semana: "Lunes",
      hora_inicio: "08:00:00",
      hora_fin: "17:00:00",
      estado: "activo",
    },
    {
      dia_semana: "Martes",
      hora_inicio: "08:00:00",
      hora_fin: "17:00:00",
      estado: "activo",
    },
    {
      dia_semana: "Miércoles",
      hora_inicio: "08:00:00",
      hora_fin: "17:00:00",
      estado: "activo",
    },
    {
      dia_semana: "Jueves",
      hora_inicio: "08:00:00",
      hora_fin: "17:00:00",
      estado: "activo",
    },
    {
      dia_semana: "Viernes",
      hora_inicio: "08:00:00",
      hora_fin: "17:00:00",
      estado: "activo",
    },
    {
      dia_semana: "Sábado",
      hora_inicio: "08:00:00",
      hora_fin: "12:00:00",
      estado: "activo",
    },
  ];

  for (const horario of horarios) {
    const [existente] =
      await connection.query(
        `SELECT id_horario
         FROM horarios
         WHERE dia_semana = ?
         LIMIT 1`,
        [horario.dia_semana]
      );

    if (existente.length > 0) {
      console.log(
        `Horario ya existe, se omite: ${horario.dia_semana}`
      );
      continue;
    }

    await connection.query(
      `INSERT INTO horarios
      (
        dia_semana,
        hora_inicio,
        hora_fin,
        estado
      )
      VALUES (?, ?, ?, ?)`,
      [
        horario.dia_semana,
        horario.hora_inicio,
        horario.hora_fin,
        horario.estado,
      ]
    );

    console.log(
      `Horario creado: ${horario.dia_semana}`
    );
  }
}

module.exports = seedHorarios;