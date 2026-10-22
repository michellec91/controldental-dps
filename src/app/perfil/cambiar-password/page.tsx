"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaLock,
} from "react-icons/fa";

import Navbar from "../../../components/Navbar";
import ProtectedRoute from "../../../features/autenticacion/components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import { cambiarPasswordUsuario } from "../../../services/usuariosService";
import styles from "./page.module.css";

export default function CambiarPasswordPage() {
  const { usuario } = useAuth();
  const router = useRouter();

  const [contrasenaActual, setContrasenaActual] =
    useState("");

  const [contrasenaNueva, setContrasenaNueva] =
    useState("");

  const [
    confirmarContrasena,
    setConfirmarContrasena,
  ] = useState("");

  const [
    mostrarActual,
    setMostrarActual,
  ] = useState(false);

  const [
    mostrarNueva,
    setMostrarNueva,
  ] = useState(false);

  const [
    mostrarConfirmacion,
    setMostrarConfirmacion,
  ] = useState(false);

  const [guardando, setGuardando] =
    useState(false);

  const [error, setError] =
    useState("");

  const [exito, setExito] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setExito("");

    if (!usuario) {
      setError(
        "No se encontró una sesión activa."
      );
      return;
    }

    if (
      !contrasenaActual ||
      !contrasenaNueva ||
      !confirmarContrasena
    ) {
      setError(
        "Completa todos los campos."
      );
      return;
    }

    if (contrasenaNueva.length < 8) {
      setError(
        "La nueva contraseña debe tener al menos 8 caracteres."
      );
      return;
    }

    if (
      contrasenaNueva !==
      confirmarContrasena
    ) {
      setError(
        "Las contraseñas nuevas no coinciden."
      );
      return;
    }

    if (
      contrasenaActual ===
      contrasenaNueva
    ) {
      setError(
        "La nueva contraseña debe ser diferente a la contraseña actual."
      );
      return;
    }

    try {
      setGuardando(true);

      await cambiarPasswordUsuario(
        usuario.id,
        contrasenaActual,
        contrasenaNueva
      );

      setExito(
        "La contraseña se actualizó correctamente."
      );

      setContrasenaActual("");
      setContrasenaNueva("");
      setConfirmarContrasena("");

      setTimeout(() => {
        router.push("/perfil");
      }, 1200);
    } catch (error) {
      console.error(
        "Error cambiando contraseña:",
        error
      );

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "No fue posible cambiar la contraseña."
        );
      }
    } finally {
      setGuardando(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className={styles.page}>
        <Navbar />

        <main className={styles.container}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() =>
              router.push("/perfil")
            }
          >
            <FaArrowLeft />
            Volver al perfil
          </button>

          <header className={styles.header}>
            <h1>Cambiar contraseña</h1>

            <p>
              Actualiza la contraseña de tu
              cuenta administrativa.
            </p>
          </header>

          <form
            className={styles.card}
            onSubmit={handleSubmit}
          >
            <div
              className={styles.sectionHeader}
            >
              <div>
                <span>
                  Seguridad de la cuenta
                </span>

                <h2>
                  Actualizar contraseña
                </h2>
              </div>
            </div>

            <div className={styles.formGrid}>
              {/* CONTRASEÑA ACTUAL */}
              <div className={styles.field}>
                <label htmlFor="actual">
                  Contraseña actual
                </label>

                <div
                  className={
                    styles.inputContainer
                  }
                >
                  <FaLock />

                  <input
                    id="actual"
                    type={
                      mostrarActual
                        ? "text"
                        : "password"
                    }
                    value={
                      contrasenaActual
                    }
                    onChange={(e) =>
                      setContrasenaActual(
                        e.target.value
                      )
                    }
                    placeholder="Contraseña actual"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarActual(
                        (valor) => !valor
                      )
                    }
                    aria-label={
                      mostrarActual
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {mostrarActual ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>

              {/* CONTRASEÑA NUEVA */}
              <div className={styles.field}>
                <label htmlFor="nueva">
                  Nueva contraseña
                </label>

                <div
                  className={
                    styles.inputContainer
                  }
                >
                  <FaLock />

                  <input
                    id="nueva"
                    type={
                      mostrarNueva
                        ? "text"
                        : "password"
                    }
                    value={
                      contrasenaNueva
                    }
                    onChange={(e) =>
                      setContrasenaNueva(
                        e.target.value
                      )
                    }
                    placeholder="Nueva contraseña"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarNueva(
                        (valor) => !valor
                      )
                    }
                    aria-label={
                      mostrarNueva
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {mostrarNueva ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRMAR CONTRASEÑA */}
              <div className={styles.field}>
                <label htmlFor="confirmar">
                  Confirmar nueva contraseña
                </label>

                <div
                  className={
                    styles.inputContainer
                  }
                >
                  <FaLock />

                  <input
                    id="confirmar"
                    type={
                      mostrarConfirmacion
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmarContrasena
                    }
                    onChange={(e) =>
                      setConfirmarContrasena(
                        e.target.value
                      )
                    }
                    placeholder="Confirma la nueva contraseña"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarConfirmacion(
                        (valor) => !valor
                      )
                    }
                    aria-label={
                      mostrarConfirmacion
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {mostrarConfirmacion ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {exito && (
              <div className={styles.success}>
                {exito}
              </div>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={
                  styles.cancelButton
                }
                onClick={() =>
                  router.push("/perfil")
                }
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className={
                  styles.saveButton
                }
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : "Cambiar contraseña"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}