// Define la estructura que tendrá cada cita.
export interface Cita {
  id: string;
  paciente: string;
  tratamiento: string;
  fecha: string;
  hora: string;
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