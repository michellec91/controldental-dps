"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { obtenerFirebaseAuth } from "../lib/firebase";
import { loginUsuario } from "../services/usuariosService";

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
  iniciarSesion: (correo: string, contrasena: string) => Promise<void>;
  actualizarUsuarioSesion: (datos: Partial<UsuarioSesion>) => void;
  cerrarSesion: () => Promise<void>;
  cargando: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function esAdministradorActivo(usuario: UsuarioSesion): boolean {
  return (
    usuario.rol.toLowerCase() === "administrador" &&
    usuario.estado.toLowerCase() === "activo"
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelarSuscripcion: (() => void) | undefined;

    try {
      cancelarSuscripcion = onAuthStateChanged(
        obtenerFirebaseAuth(),
        (usuarioFirebase) => {
          try {
            const sesionGuardada = localStorage.getItem("usuario");
            const usuarioGuardado = sesionGuardada
              ? (JSON.parse(sesionGuardada) as UsuarioSesion)
              : null;

            const mismaCuenta =
              usuarioFirebase?.email?.toLowerCase() ===
              usuarioGuardado?.correo?.toLowerCase();

            if (
              usuarioFirebase &&
              usuarioGuardado &&
              mismaCuenta &&
              esAdministradorActivo(usuarioGuardado)
            ) {
              setUsuario(usuarioGuardado);
            } else {
              setUsuario(null);
              localStorage.removeItem("usuario");
            }
          } catch {
            setUsuario(null);
            localStorage.removeItem("usuario");
          } finally {
            setCargando(false);
          }
        },
        () => {
          setUsuario(null);
          localStorage.removeItem("usuario");
          setCargando(false);
        }
      );
    } catch {
      setUsuario(null);
      setCargando(false);
    }

    return () => cancelarSuscripcion?.();
  }, []);

  async function iniciarSesion(correo: string, contrasena: string) {
    const correoNormalizado = correo.trim().toLowerCase();
    const perfil = await loginUsuario(correoNormalizado, contrasena);

    if (perfil.rol.toLowerCase() !== "administrador") {
      throw new Error("Esta cuenta no tiene permisos administrativos.");
    }

    if (perfil.estado.toLowerCase() !== "activo") {
      throw new Error("Esta cuenta no se encuentra activa.");
    }

    try {
      await signInWithEmailAndPassword(
        obtenerFirebaseAuth(),
        correoNormalizado,
        contrasena
      );
    } catch (error) {
      const codigo = (error as { code?: string })?.code;

      if (codigo === "auth/invalid-credential") {
        throw new Error("Correo o contraseña incorrectos en Firebase.");
      }

      if (codigo === "auth/user-not-found" || codigo === "auth/wrong-password") {
        throw new Error("Correo o contraseña incorrectos en Firebase.");
      }

      if (codigo === "auth/network-request-failed") {
        throw new Error("No fue posible conectar con Firebase Authentication.");
      }

      if (codigo === "auth/user-disabled") {
        throw new Error("La cuenta de Firebase está deshabilitada.");
      }

      throw error;
    }

    const nuevaSesion: UsuarioSesion = {
      id: String(perfil.id_usuario),
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      correo: perfil.correo,
      telefono: perfil.telefono,
      rol: perfil.rol,
      estado: perfil.estado,
      imagenPerfil: perfil.imagen_perfil || undefined,
    };

    localStorage.setItem("usuario", JSON.stringify(nuevaSesion));
    setUsuario(nuevaSesion);
  }

  function actualizarUsuarioSesion(datos: Partial<UsuarioSesion>) {
    setUsuario((usuarioActual) => {
      if (!usuarioActual) {
        return null;
      }

      const usuarioActualizado: UsuarioSesion = {
        ...usuarioActual,
        ...datos,
      };

      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
      return usuarioActualizado;
    });
  }

  async function cerrarSesion() {
    await signOut(obtenerFirebaseAuth());
    localStorage.removeItem("usuario");
    setUsuario(null);
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
