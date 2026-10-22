"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  rolPermitido?: string;
}

export default function ProtectedRoute({
  children,
  rolPermitido = "Administrador",
}: ProtectedRouteProps) {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (cargando) {
      return;
    }

    if (!usuario) {
      router.replace("/login");
      return;
    }

    const rolUsuario = usuario.rol?.toLowerCase();
    const rolRequerido = rolPermitido.toLowerCase();
    const estadoUsuario = usuario.estado?.toLowerCase();

    if (rolUsuario !== rolRequerido) {
      router.replace("/login");
      return;
    }

    if (estadoUsuario !== "activo") {
      router.replace("/login");
    }
  }, [usuario, cargando, rolPermitido, router]);

  if (cargando) {
    return <p>Cargando...</p>;
  }

  if (!usuario) {
    return null;
  }

  const rolUsuario = usuario.rol?.toLowerCase();
  const rolRequerido = rolPermitido.toLowerCase();
  const estadoUsuario = usuario.estado?.toLowerCase();

  if (
    rolUsuario !== rolRequerido ||
    estadoUsuario !== "activo"
  ) {
    return null;
  }

  return <>{children}</>;
}