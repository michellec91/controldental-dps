"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaEye,
  FaEyeSlash,
  FaLock,
} from "react-icons/fa";

import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../features/autenticacion/components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import styles from "./page.module.css";

export default function CambiarPasswordPage() {
  const { usuario, cerrarSesion } = useAuth();
  const router = useRouter();

  const [contrasenaActual, setContrasenaActual] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [mostrarActual, setMostrarActual] = useState(false);
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setExito("");

    if (!usuario) {
      setError("No se encontró una sesión activa.");
      return;
    }

    if (
      !contrasenaActual.trim() ||
      !nuevaContrasena.trim() ||
      !confirmarContrasena.trim()
    ) {
      setError("Completa todos los campos.");
      return;
    }

    if (nuevaContrasena.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (nuevaContrasena === contrasenaActual) {
      setError(
        "La nueva contraseña debe ser diferente de la contraseña actual."
      );
      return;
    }

    if (nuevaContrasena !== confirmarContrasena) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }

    try {
      setGuardando(true);

      // Obtener los datos actuales del usuario.
      const respuestaUsuario = await fetch(
        `http://localhost:3001/usuarios/${usuario.id}`
      );

      if (!respuestaUsuario.ok) {
        throw new Error("No fue posible consultar el usuario.");
      }

      const usuarioActual = await respuestaUsuario.json();

      // Comprobar la contraseña actual.
      if (usuarioActual.contrasena !== contrasenaActual) {
        setError("La contraseña actual es incorrecta.");
        return;
      }

      // Actualizar únicamente la contraseña.
      const respuestaActualizacion = await fetch(
        `http://localhost:3001/usuarios/${usuario.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contrasena: nuevaContrasena,
          }),
        }
      );

      if (!respuestaActualizacion.ok) {
        throw new Error("No fue posible actualizar la contraseña.");
      }

      setExito(
        "Contraseña actualizada correctamente. Serás redirigido al inicio de sesión."
      );

      setContrasenaActual("");
      setNuevaContrasena("");
      setConfirmarContrasena("");

      // Por seguridad, cerrar la sesión después de cambiar contraseña.
      setTimeout(() => {
        cerrarSesion();
        router.replace("/login");
      }, 1500);
    } catch (error) {
      console.error(error);

      setError(
        "No fue posible conectar con el servidor. Verifica que la API esté activa."
      );
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
            onClick={() => router.push("/perfil")}
          >
            <FaArrowLeft />
            Volver al perfil
          </button>

          <div className={styles.header}>
            <h1>Cambiar contraseña</h1>
            <p>
              Actualiza la contraseña utilizada para acceder a tu cuenta
              administrativa.
            </p>
          </div>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.lockIcon}>
                <FaLock />
              </div>

              <div>
                <h2>Seguridad de la cuenta</h2>
                <p>
                  Utiliza una contraseña diferente a la que tienes actualmente.
                </p>
              </div>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="actual">Contraseña actual</label>

                <div className={styles.inputContainer}>
                  <FaLock className={styles.inputIcon} />

                  <input
                    id="actual"
                    type={mostrarActual ? "text" : "password"}
                    value={contrasenaActual}
                    onChange={(event) =>
                      setContrasenaActual(event.target.value)
                    }
                    placeholder="Ingresa tu contraseña actual"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() =>
                      setMostrarActual((valorActual) => !valorActual)
                    }
                    aria-label={
                      mostrarActual
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {mostrarActual ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="nueva">Nueva contraseña</label>

                <div className={styles.inputContainer}>
                  <FaLock className={styles.inputIcon} />

                  <input
                    id="nueva"
                    type={mostrarNueva ? "text" : "password"}
                    value={nuevaContrasena}
                    onChange={(event) =>
                      setNuevaContrasena(event.target.value)
                    }
                    placeholder="Ingresa la nueva contraseña"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() =>
                      setMostrarNueva((valorActual) => !valorActual)
                    }
                    aria-label={
                      mostrarNueva
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {mostrarNueva ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <span className={styles.helpText}>
                  Debe contener al menos 8 caracteres.
                </span>
              </div>

              <div className={styles.field}>
                <label htmlFor="confirmacion">
                  Confirmar nueva contraseña
                </label>

                <div className={styles.inputContainer}>
                  <FaLock className={styles.inputIcon} />

                  <input
                    id="confirmacion"
                    type={mostrarConfirmacion ? "text" : "password"}
                    value={confirmarContrasena}
                    onChange={(event) =>
                      setConfirmarContrasena(event.target.value)
                    }
                    placeholder="Repite la nueva contraseña"
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() =>
                      setMostrarConfirmacion(
                        (valorActual) => !valorActual
                      )
                    }
                    aria-label={
                      mostrarConfirmacion
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {mostrarConfirmacion ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {error && (
                <div className={styles.errorMessage}>
                  {error}
                </div>
              )}

              {exito && (
                <div className={styles.successMessage}>
                  <FaCheckCircle />
                  {exito}
                </div>
              )}

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => router.push("/perfil")}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={guardando || Boolean(exito)}
                >
                  {guardando
                    ? "Guardando..."
                    : "Actualizar contraseña"}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}