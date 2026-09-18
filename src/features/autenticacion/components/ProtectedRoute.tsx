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
  rolPermitido = "admin",
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

    if (usuario.rol !== rolPermitido) {
      router.replace("/login");
      return;
    }

    if (usuario.estado !== "activo") {
      router.replace("/login");
    }
  }, [usuario, cargando, rolPermitido, router]);

  if (cargando) {
    return <p>Cargando...</p>;
  }

  if (
    !usuario ||
    usuario.rol !== rolPermitido ||
    usuario.estado !== "activo"
  ) {
    return null;
  }

  return <>{children}</>;
}