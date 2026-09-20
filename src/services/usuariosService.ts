export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  contrasena: string;
  rol: string;
  estado: string;
  imagenPerfil?:string;
}

const API_URL = "http://localhost:3001";

export async function obtenerUsuarioPorCorreo(
  correo: string
): Promise<Usuario | null> {
  const respuesta = await fetch(
    `${API_URL}/usuarios?correo=${encodeURIComponent(correo)}`
  );

  if (!respuesta.ok) {
    throw new Error("No se pudo consultar el usuario.");
  }

  const usuarios: Usuario[] = await respuesta.json();

  return usuarios.length > 0 ? usuarios[0] : null;
}