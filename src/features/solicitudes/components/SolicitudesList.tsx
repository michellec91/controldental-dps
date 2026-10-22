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
        return "bg-yellow-100 text-yellow-800";

      case "confirmada":
        return "bg-green-100 text-green-800";

      case "completada":
        return "bg-blue-100 text-blue-800";

      case "cancelada":
        return "bg-red-100 text-red-800";

      default:
        return "bg-gray-100 text-gray-800";
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

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Solicitudes de Citas
          </h1>

          {/* FILTRO */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>

            <select
              value={
                filtroEstado
              }
              onChange={(e) =>
                setFiltroEstado(
                  e.target.value
                )
              }
              className="w-full sm:w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-sky-500"
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
              <p className="text-gray-600 text-base font-medium">
                Cargando
                solicitudes...
              </p>
            </div>
          ) : error ? (
            // ERROR
            <div className="flex justify-center items-center py-16">
              <p className="text-red-600 text-base font-medium">
                {error}
              </p>
            </div>
          ) : citasFiltradas.length ===
            0 ? (
            // SIN DATOS
            <div className="flex justify-center items-center py-16">
              <p className="text-gray-500 text-base">
                No hay solicitudes
                para mostrar.
              </p>
            </div>
          ) : (
            // LISTA
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {citasFiltradas.map(
                (cita) => (
                  <div
                    key={
                      cita.id_cita
                    }
                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
                  >
                    {/* ESTADO */}
                    <div className="mb-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${obtenerEstiloEstado(
                          cita.estado
                        )}`}
                      >
                        {
                          cita.estado
                        }
                      </span>
                    </div>

                    {/* PACIENTE */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600">
                        Paciente
                      </p>

                      <p className="text-sm text-gray-900">
                        {[
                          cita.paciente_nombre,
                          cita.paciente_apellido,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " "
                          )}
                      </p>
                    </div>

                    {/* TRATAMIENTO */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600">
                        Tratamiento
                      </p>

                      <p className="text-sm text-gray-900">
                        {
                          cita.tratamiento_nombre
                        }
                      </p>
                    </div>

                    {/* FECHA */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600">
                        Fecha
                      </p>

                      <p className="text-sm text-gray-900">
                        {formatearFecha(
                          cita.fecha
                        )}
                      </p>
                    </div>

                    {/* HORA */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600">
                        Hora
                      </p>

                      <p className="text-sm text-gray-900">
                        {formatearHora(
                          cita.hora
                        )}
                      </p>
                    </div>

                    {/* CORREO */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600">
                        Correo electrónico
                      </p>

                      <p className="text-sm text-gray-900 break-words">
                        {
                          cita.correo ||
                          "-"
                        }
                      </p>
                    </div>

                    {/* TELÉFONO */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-600">
                        Teléfono
                      </p>

                      <p className="text-sm text-gray-900">
                        {
                          cita.telefono ||
                          "-"
                        }
                      </p>
                    </div>

                    {/* ACCIONES */}
                    {cita.estado?.toLowerCase() ===
                      "pendiente" && (
                      <div className="flex gap-2 mt-6">
                        <button
                          type="button"
                          onClick={() =>
                            confirmarCita(
                              cita.id_cita
                            )
                          }
                          className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
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
                          className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
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