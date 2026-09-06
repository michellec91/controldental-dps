"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "../../features/autenticacion/components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";

export default function AdminPruebaPage() {
  const { usuario, cerrarSesion } = useAuth();
  const router = useRouter();

  function handleCerrarSesion() {
    cerrarSesion();
    router.replace("/login");
  }

  return (
    <ProtectedRoute>
      <main style={{ padding: "40px" }}>
        <h1>Ruta administrativa protegida</h1>

        <p>
          Si podés ver esta página, la sesión de administrador está funcionando.
        </p>

        <p>
          Usuario: <strong>{usuario?.nombre}</strong>
        </p>

        <p>
          Rol: <strong>{usuario?.rol}</strong>
        </p>

        <button
          type="button"
          onClick={handleCerrarSesion}
          style={{
            marginTop: "20px",
            padding: "10px 18px",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </main>
    </ProtectedRoute>
  );
}