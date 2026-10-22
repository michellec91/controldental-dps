export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  rol: string;
  estado: string;
  imagen_perfil?: string | null;
}

export interface ActualizarPerfilDatos {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

// -----------------------------------------
// LOGIN
// -----------------------------------------
export async function loginUsuario(
  correo: string,
  password: string
): Promise<Usuario> {
  const response = await fetch(
    `${API_URL}/usuarios/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        correo,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "No fue posible iniciar sesión."
    );
  }

  return data.usuario;
}

// -----------------------------------------
// ACTUALIZAR PERFIL
// -----------------------------------------
export async function actualizarPerfilUsuario(
  id: string,
  datos: ActualizarPerfilDatos
) {
  const response = await fetch(
    `${API_URL}/usuarios/${id}`,
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
        "No fue posible actualizar el perfil."
    );
  }

  return data;
}

// -----------------------------------------
// CAMBIAR CONTRASEÑA
// -----------------------------------------
export async function cambiarPasswordUsuario(
  id: string,
  contrasenaActual: string,
  contrasenaNueva: string
) {
  const response = await fetch(
    `${API_URL}/usuarios/${id}/change-password`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contrasenaActual,
        contrasenaNueva,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "No fue posible cambiar la contraseña."
    );
  }

  return data;
}

// -----------------------------------------
// ACTUALIZAR IMAGEN DE PERFIL
// -----------------------------------------
export async function actualizarImagenPerfil(
  id: string,
  imagen: string
) {
  const response = await fetch(
    `${API_URL}/usuarios/${id}/imagen-perfil`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imagen_perfil: imagen,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "No fue posible actualizar la fotografía."
    );
  }

  return data;
}