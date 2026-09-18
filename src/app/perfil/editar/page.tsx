"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaEnvelope, FaPhone, FaUser } from "react-icons/fa";

import Navbar from "../../../components/Navbar";
import ProtectedRoute from "../../../features/autenticacion/components/ProtectedRoute";
import { useAuth } from "../../../context/AuthContext";
import styles from "./page.module.css";

interface DatosUsuario {
  nombre: string;
  apellido?: string;
  correo: string;
  telefono?: string;
  direccion?: string;
}

export default function EditarPerfilPage() {
  const { usuario, actualizarUsuarioSesion } = useAuth();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
  if (!usuario) return;

  const usuarioActual = usuario;

  async function cargarDatos() {
    try {
      const respuesta = await fetch(
        `http://localhost:3001/usuarios/${usuarioActual.id}`
      );

      if (!respuesta.ok) {
        throw new Error();
      }

      const datos: DatosUsuario = await respuesta.json();

      setNombre(datos.nombre ?? "");
      setApellido(datos.apellido ?? "");
      setCorreo(datos.correo ?? "");
      setTelefono(datos.telefono ?? "");
      setDireccion(datos.direccion ?? "");
    } catch {
      setNombre(usuarioActual.nombre);
      setCorreo(usuarioActual.correo);
    }
  }

  cargarDatos();
}, [usuario]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setExito("");

    if (!usuario) {
      setError("No se encontró una sesión activa.");
      return;
    }

    if (!nombre.trim() || !correo.trim()) {
      setError("El nombre y el correo electrónico son obligatorios.");
      return;
    }

    try {
      setGuardando(true);

      const respuesta = await fetch(
        `http://localhost:3001/usuarios/${usuario.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            correo: correo.trim(),
            telefono: telefono.trim(),
            direccion: direccion.trim(),
          }),
        }
      );

      if (!respuesta.ok) {
        throw new Error();
      }

      actualizarUsuarioSesion({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        correo: correo.trim(),
        telefono: telefono.trim(),
      });

      setExito("La información se actualizó correctamente.");

      setTimeout(() => {
        router.push("/perfil");
      }, 1200);
    } catch {
      setError(
        "No fue posible actualizar la información. Verifica que la API esté activa."
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

          <header className={styles.header}>
            <h1>Editar perfil</h1>
            <p>
              Actualiza la información de tu cuenta administrativa.
            </p>
          </header>

          <form className={styles.card} onSubmit={handleSubmit}>
            <div className={styles.sectionHeader}>
              <div>
                <span>Cuenta administrativa</span>
                <h2>Información personal</h2>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="nombre">Nombre</label>

                <div className={styles.inputContainer}>
                  <FaUser />
                  <input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="apellido">Apellido</label>

                <div className={styles.inputContainer}>
                  <FaUser />
                  <input
                    id="apellido"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Apellido"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="correo">Correo electrónico</label>

                <div className={styles.inputContainer}>
                  <FaEnvelope />
                  <input
                    id="correo"
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="telefono">Teléfono</label>

                <div className={styles.inputContainer}>
                  <FaPhone />
                  <input
                    id="telefono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="0000-0000"
                  />
                </div>
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label htmlFor="direccion">
                  Dirección / información de contacto
                </label>

                <textarea
                  id="direccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ingresa información adicional de contacto"
                  rows={4}
                />
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
                className={styles.cancelButton}
                onClick={() => router.push("/perfil")}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className={styles.saveButton}
                disabled={guardando}
              >
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}