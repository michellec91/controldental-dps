// Define la estructura que tendrá cada cita.
export interface Cita {
  id: string;
  paciente: string;
  tratamiento: string;
  fecha: string;
  hora: string;
  correo: string;
  telefono: string;
  estado: string;
}

// Dirección donde está funcionando nuestro JSON Server.
const API_URL = "http://localhost:3001";

// Obtiene todas las citas registradas en la API.
export async function obtenerCitas(): Promise<Cita[]> {
  const respuesta = await fetch(`${API_URL}/citas`);

// Verificamos que la petición haya respondido correctamente.
  if (!respuesta.ok) {
    throw new Error("No se pudieron consultar las citas.");
  }

  return await respuesta.json();
}

// Obtiene únicamente las citas que están pendientes de revisión.
export async function obtenerSolicitudesPendientes(): Promise<Cita[]> {
  const respuesta = await fetch(`${API_URL}/citas?estado=pendiente`);

  if (!respuesta.ok) {
    throw new Error("No se pudieron consultar las solicitudes pendientes.");
  }

  return await respuesta.json();
}

// Actualiza el estado de una cita.
export async function actualizarEstadoCita(
  id: string,
  estado: string
): Promise<Cita> {
  const respuesta = await fetch(`${API_URL}/citas/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ estado }),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo actualizar el estado de la cita.");
  }

  return await respuesta.json();
}