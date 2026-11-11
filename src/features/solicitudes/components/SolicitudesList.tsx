"use client";

import { useEffect, useState } from "react";

import {
  Cita,
  obtenerCitas,
  actualizarEstadoCita,
} from "../../../services/citasService";

import Navbar from "../../../components/Navbar";

import {
  alertConfirm,
  alertSuccess,
  alertError,
} from "../../../lib/alert";

export default function SolicitudesList() {
  // Guarda las citas obtenidas desde la API.
  const [citas, setCitas] =
    useState<Cita[]>([]);

  // Indica si estamos cargando.
  const [cargando, setCargando] =
    useState(true);

  // Guarda errores de carga.
  const [error, setError] =
    useState("");

  // Estado seleccionado en el filtro.
  const [filtroEstado, setFiltroEstado] =
    useState("Pendiente");

  useEffect(() => {
    cargarCitas();
  }, []);

  // -----------------------------------------
  // CARGAR CITAS
  // -----------------------------------------
  async function cargarCitas() {
    setCargando(true);
    setError("");

    try {
      const datos =
        await obtenerCitas();

      setCitas(datos);
    } catch (error) {
      console.error(
        "Error al cargar las citas:",
        error
      );

      setError(
        "No se pudieron cargar las solicitudes."
      );
    } finally {
      setCargando(false);
    }
  }

  // -----------------------------------------
  // CONFIRMAR CITA
  // -----------------------------------------
  async function confirmarCita(
    id: number
  ) {
    const confirmado =
      await alertConfirm({
        title:
          "¿Confirmar cita?",
      });

    if (!confirmado) {
      return;
    }

    try {
      await actualizarEstadoCita(
        id,
        "Confirmada"
      );

      await cargarCitas();

      alertSuccess(
        "Cita confirmada"
      );
    } catch (error) {
      console.error(
        "Error al confirmar cita:",
        error
      );

      alertError(
        "Error",
        "No fue posible confirmar la cita."
      );
    }
  }

  // -----------------------------------------
  // CANCELAR / RECHAZAR SOLICITUD
  // -----------------------------------------
  async function rechazarCita(
    id: number
  ) {
    const confirmado =
      await alertConfirm({
        title:
          "¿Rechazar cita?",
      });

    if (!confirmado) {
      return;
    }

    try {
      await actualizarEstadoCita(
        id,
        "Cancelada"
      );

      await cargarCitas();

      alertSuccess(
        "Cita cancelada"
      );
    } catch (error) {
      console.error(
        "Error al cancelar cita:",
        error
      );

      alertError(
        "Error",
        "No fue posible cancelar la cita."
      );
    }
  }

  // -----------------------------------------
  // FORMATEAR FECHA
  // -----------------------------------------
  function formatearFecha(
    fecha: string
  ) {
    if (!fecha) {
      return "-";
    }

    const fechaLimpia =
      fecha.includes("T")
        ? fecha.split("T")[0]
        : fecha;

    return new Date(
      `${fechaLimpia}T00:00:00`
    ).toLocaleDateString(
      "es-ES",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }

  // -----------------------------------------
  // FORMATEAR HORA
  // -----------------------------------------
  function formatearHora(
    hora: string
  ) {
    if (!hora) {
      return "-";
    }

    return hora.slice(0, 5);
  }

  // -----------------------------------------
  // ESTILO SEGÚN ESTADO
  // -----------------------------------------
  function obtenerEstiloEstado(
    estado: string
  ) {
    switch (
      estado.toLowerCase()
    ) {
        case "pendiente":
        return "bg-yellow-500/15 text-yellow-500 border border-yellow-500/30";

      case "confirmada":
        return "bg-green-500/15 text-green-500 border border-green-500/30";

      case "completada":
        return "bg-blue-500/15 text-blue-400 border border-blue-500/30";

      case "cancelada":
        return "bg-red-500/15 text-red-400 border border-red-500/30";

      default:
        return "bg-slate-500/15 text-[var(--text-secondary)] border border-[var(--border)]";
    }
  }

  // -----------------------------------------
  // FILTRAR CITAS
  // -----------------------------------------
  const citasFiltradas =
    citas.filter((cita) => {
      if (
        filtroEstado ===
        "Todas"
      ) {
        return true;
      }

      return (
        cita.estado?.toLowerCase() ===
        filtroEstado.toLowerCase()
      );
    });

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
            Solicitudes de Citas
          </h1>

          {/* FILTRO */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Estado
            </label>

            <select
              value={filtroEstado}
              onChange={(e) =>
                setFiltroEstado(
                  e.target.value
                )
              }
              className="
                w-full
                sm:w-64

                rounded-lg

                border
                border-[var(--border)]

                bg-[var(--input)]

                px-3
                py-2

                text-sm
                text-[var(--text)]

                outline-none

                focus:border-[var(--primary)]
                focus:ring-2
                focus:ring-[var(--primary)]

                transition-colors
              "
            >
              <option value="Pendiente">
                Pendientes
              </option>

              <option value="Confirmada">
                Confirmadas
              </option>

              <option value="Cancelada">
                Canceladas
              </option>

              <option value="Completada">
                Completadas
              </option>

              <option value="Todas">
                Todas
              </option>
            </select>
          </div>

          {/* CARGANDO */}
          {cargando ? (
            <div className="flex justify-center items-center py-16">
              <p className="text-[var(--text-secondary)] text-base font-medium">
                Cargando solicitudes...
              </p>
            </div>

          ) : error ? (

            /* ERROR */
            <div className="flex justify-center items-center py-16">
              <p className="text-red-500 text-base font-medium">
                {error}
              </p>
            </div>

          ) : citasFiltradas.length === 0 ? (

            /* SIN DATOS */
            <div
              className="
                mt-6

                flex
                justify-center
                items-center

                py-16

                bg-[var(--surface)]

                border
                border-dashed
                border-[var(--border)]

                rounded-xl
              "
            >
              <p className="text-[var(--text-secondary)] text-base">
                No hay solicitudes para mostrar.
              </p>
            </div>

          ) : (

            /* LISTA */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">

              {citasFiltradas.map(
                (cita) => (
                  <div
                    key={
                      cita.id_cita
                    }
                    className="
                      bg-[var(--surface)]

                      border
                      border-[var(--border)]

                      rounded-2xl

                      shadow-sm

                      p-5

                      transition-colors
                    "
                  >

                    {/* ESTADO */}
                    <div className="mb-5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${obtenerEstiloEstado(
                          cita.estado
                        )}`}
                      >
                        {cita.estado}
                      </span>
                    </div>

                    {/* PACIENTE */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-[var(--text-secondary)]">
                        Paciente
                      </p>

                      <p className="text-sm text-[var(--text)] mt-1">
                        {[
                          cita.paciente_nombre,
                          cita.paciente_apellido,
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                    </div>

                    {/* TRATAMIENTO */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-[var(--text-secondary)]">
                        Tratamiento
                      </p>

                      <p className="text-sm text-[var(--text)] mt-1">
                        {
                          cita.tratamiento_nombre
                        }
                      </p>
                    </div>

                    {/* FECHA */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-[var(--text-secondary)]">
                        Fecha
                      </p>

                      <p className="text-sm text-[var(--text)] mt-1">
                        {formatearFecha(
                          cita.fecha
                        )}
                      </p>
                    </div>

                    {/* HORA */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-[var(--text-secondary)]">
                        Hora
                      </p>

                      <p className="text-sm text-[var(--text)] mt-1">
                        {formatearHora(
                          cita.hora
                        )}
                      </p>
                    </div>

                    {/* CORREO */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-[var(--text-secondary)]">
                        Correo electrónico
                      </p>

                      <p className="text-sm text-[var(--text)] mt-1 break-words">
                        {
                          cita.correo ||
                          "-"
                        }
                      </p>
                    </div>

                    {/* TELÉFONO */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-[var(--text-secondary)]">
                        Teléfono
                      </p>

                      <p className="text-sm text-[var(--text)] mt-1">
                        {
                          cita.telefono ||
                          "-"
                        }
                      </p>
                    </div>

                    {/* ACCIONES */}
                    {cita.estado?.toLowerCase() ===
                      "pendiente" && (
                      <div
                        className="
                          flex
                          gap-3

                          mt-6
                          pt-4

                          border-t
                          border-[var(--border)]
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            confirmarCita(
                              cita.id_cita
                            )
                          }
                          className="
                            flex-1

                            px-4
                            py-2.5

                            rounded-lg

                            bg-green-500/15
                            text-green-500

                            border
                            border-green-500/30

                            text-sm
                            font-semibold

                            hover:bg-green-500/25

                            transition-colors
                          "
                        >
                          Confirmar
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            rechazarCita(
                              cita.id_cita
                            )
                          }
                          className="
                            flex-1

                            px-4
                            py-2.5

                            rounded-lg

                            bg-red-500/15
                            text-red-400

                            border
                            border-red-500/30

                            text-sm
                            font-semibold

                            hover:bg-red-500/25

                            transition-colors
                          "
                        >
                          Rechazar
                        </button>
                      </div>
                    )}

                  </div>
                )
              )}

            </div>
          )}

        </div>
      </main>
    </>
  );
}