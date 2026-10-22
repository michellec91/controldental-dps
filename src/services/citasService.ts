export interface Cita {
  id_cita: number;

  id_usuario: number;
  paciente_nombre: string;
  paciente_apellido: string;
  correo: string;
  telefono: string;

  id_tratamiento: number;
  tratamiento_nombre: string;

  fecha: string;
  hora: string;
  estado: string;

  fecha_creacion?: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

// -----------------------------------------
// OBTENER TODAS LAS CITAS
// -----------------------------------------
export async function obtenerCitas(): Promise<Cita[]> {
  const respuesta = await fetch(
    `${API_URL}/citas`
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.error ||
        "No se pudieron consultar las citas."
    );
  }

  return data;
}

// -----------------------------------------
// OBTENER SOLICITUDES PENDIENTES
// -----------------------------------------
export async function obtenerSolicitudesPendientes(): Promise<
  Cita[]
> {
  const respuesta = await fetch(
    `${API_URL}/citas?estado=pendiente`
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.error ||
        "No se pudieron consultar las solicitudes pendientes."
    );
  }

  return data;
}

// -----------------------------------------
// ACTUALIZAR ESTADO
// -----------------------------------------
export async function actualizarEstadoCita(
  id: number,
  estado: string
): Promise<Cita> {
  const respuesta = await fetch(
    `${API_URL}/citas/${id}/estado`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        estado,
      }),
    }
  );

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      data.error ||
        "No se pudo actualizar el estado de la cita."
    );
  }

  return data.cita || data;
}