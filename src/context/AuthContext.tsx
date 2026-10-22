"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface UsuarioSesion {
  id: string;
  nombre: string;
  apellido?: string;
  correo: string;
  telefono?: string;
  rol: string;
  estado: string;
  imagenPerfil?: string;
}

interface AuthContextType {
  usuario: UsuarioSesion | null;

  iniciarSesion: (usuario: UsuarioSesion) => void;

  actualizarUsuarioSesion: (
    datos: Partial<UsuarioSesion>
  ) => void;

  cerrarSesion: () => void;

  cargando: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [usuario, setUsuario] =
    useState<UsuarioSesion | null>(null);

  const [cargando, setCargando] = useState(true);

  // Recuperar sesión guardada cuando inicia la aplicación
  useEffect(() => {
    try {
      const sesionGuardada =
        localStorage.getItem("usuario");

      if (sesionGuardada) {
        const usuarioGuardado: UsuarioSesion =
          JSON.parse(sesionGuardada);

        setUsuario(usuarioGuardado);
      }
    } catch (error) {
      console.error(
        "Error al recuperar la sesión:",
        error
      );

      localStorage.removeItem("usuario");
    } finally {
      setCargando(false);
    }
  }, []);

  // Iniciar sesión
  function iniciarSesion(usuarioNuevo: UsuarioSesion) {
    setUsuario(usuarioNuevo);

    localStorage.setItem(
      "usuario",
      JSON.stringify(usuarioNuevo)
    );
  }

  // Actualizar datos del usuario guardado
  function actualizarUsuarioSesion(
    datos: Partial<UsuarioSesion>
  ) {
    setUsuario((usuarioActual) => {
      if (!usuarioActual) {
        return null;
      }

      const usuarioActualizado: UsuarioSesion = {
        ...usuarioActual,
        ...datos,
      };

      localStorage.setItem(
        "usuario",
        JSON.stringify(usuarioActualizado)
      );

      return usuarioActualizado;
    });
  }

  // Cerrar sesión
  function cerrarSesion() {
    setUsuario(null);
    localStorage.removeItem("usuario");
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        iniciarSesion,
        actualizarUsuarioSesion,
        cerrarSesion,
        cargando,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }

  return contexto;
}