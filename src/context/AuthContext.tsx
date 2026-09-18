"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface UsuarioSesion {
  id: string;
  nombre: string;
  apellido?: string,
  correo: string;
  telefono?: string,
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const sesionGuardada = localStorage.getItem("usuario");

    const timer = setTimeout(() => {
      if (sesionGuardada) {
        try {
          const usuarioGuardado = JSON.parse(sesionGuardada);
          setUsuario(usuarioGuardado);
        } catch {
          localStorage.removeItem("usuario");
        }
      }

      setCargando(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  function iniciarSesion(usuario: UsuarioSesion) {
    setUsuario(usuario);
    localStorage.setItem("usuario", JSON.stringify(usuario));
  }

  function actualizarUsuarioSesion(
    datos: Partial<UsuarioSesion>
  ) {
    setUsuario((usuarioActual) => {
      if (!usuarioActual) {
        return usuarioActual;
      }
    
      const usuarioActualizado = {
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
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return contexto;
}