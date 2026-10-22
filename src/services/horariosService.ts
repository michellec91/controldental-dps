export interface Horario {
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export async function obtenerHorarios(): Promise<
  Horario[]
> {
  const response = await fetch(
    `${API_URL}/horarios`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "No fue posible obtener los horarios."
    );
  }

  return data;
}

export async function obtenerHorarioPorId(
  id: number
): Promise<Horario> {
  const response = await fetch(
    `${API_URL}/horarios/${id}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "No fue posible obtener el horario."
    );
  }

  return data;
}

export async function crearHorario(
  datos: Omit<Horario, "id_horario">
) {
  const response = await fetch(
    `${API_URL}/horarios`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "No fue posible crear el horario."
    );
  }

  return data;
}

export async function actualizarHorario(
  id: number,
  datos: Omit<Horario, "id_horario">
) {
  const response = await fetch(
    `${API_URL}/horarios/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "No fue posible actualizar el horario."
    );
  }

  return data;
}

export async function eliminarHorario(
  id: number
) {
  const response = await fetch(
    `${API_URL}/horarios/${id}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "No fue posible desactivar el horario."
    );
  }

  return data;
}