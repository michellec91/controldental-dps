"use client";

import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";

import {
  Cita,
  obtenerCitas,
  actualizarEstadoCita,
} from "../../services/citasService";

import { AgendaCalendarGrid } from "./components/AgendaCalendarGrid";
import { MiniCalendar } from "./components/MiniCalendar";

import {
  alertConfirm,
  alertSuccess,
  alertError,
} from "../../lib/alert";

export default function AgendaView() {
  const [citas, setCitas] =
    useState<Cita[]>([]);

  const [
    fechaSeleccionada,
    setFechaSeleccionada,
  ] = useState<Date>(
    new Date()
  );

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  // -----------------------------------------
  // OBTENER EL LUNES DE LA SEMANA
  // -----------------------------------------
  const getLunesSemana = (
    fecha: Date
  ) => {
    const d =
      new Date(fecha);

    const day =
      d.getDay();

    const diff =
      d.getDate() -
      day +
      (day === 0 ? -6 : 1);

    d.setDate(diff);
    d.setHours(
      0,
      0,
      0,
      0
    );

    return d;
  };

  const [
    semanaInicio,
    setSemanaInicio,
  ] = useState<Date>(() =>
    getLunesSemana(
      new Date()
    )
  );

  // -----------------------------------------
  // CARGAR CITAS
  // -----------------------------------------
  const cargarCitas =
    async () => {
      setCargando(true);
      setError("");

      try {
        const datos =
          await obtenerCitas();

        setCitas(datos);
      } catch (error) {
        console.error(
          "Error al obtener citas:",
          error
        );

        setError(
          "No fue posible cargar la agenda."
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    cargarCitas();
  }, []);

  // -----------------------------------------
  // CANCELAR CITA
  // -----------------------------------------
  const handleCancelarCita =
    async (id: number) => {
      const confirmado =
        await alertConfirm({
          title:
            "¿Cancelar cita?",
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
    };

  // -----------------------------------------
  // SEMANA ANTERIOR
  // -----------------------------------------
  const irSemanaAnterior =
    () => {
      setSemanaInicio(
        (prev) => {
          const nueva =
            new Date(
              prev
            );

          nueva.setDate(
            nueva.getDate() -
              7
          );

          return nueva;
        }
      );
    };

  // -----------------------------------------
  // SEMANA SIGUIENTE
  // -----------------------------------------
  const irSemanaSiguiente =
    () => {
      setSemanaInicio(
        (prev) => {
          const nueva =
            new Date(
              prev
            );

          nueva.setDate(
            nueva.getDate() +
              7
          );

          return nueva;
        }
      );
    };

  // -----------------------------------------
  // VOLVER A ESTA SEMANA
  // -----------------------------------------
  const irAHoy = () => {
    const hoy =
      new Date();

    setFechaSeleccionada(
      hoy
    );

    setSemanaInicio(
      getLunesSemana(
        hoy
      )
    );

    cargarCitas();
  };

  // -----------------------------------------
  // SELECCIONAR FECHA MINI CALENDARIO
  // -----------------------------------------
  const handleSeleccionarFechaMiniCal =
    (fecha: Date) => {
      setFechaSeleccionada(
        fecha
      );

      setSemanaInicio(
        getLunesSemana(
          fecha
        )
      );
    };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto flex max-w-7xl gap-6 flex-col md:flex-row">

          {/* PANEL IZQUIERDO */}
          <aside className="w-full md:w-64 space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-800">
              AGENDA ADMIN
            </h1>

            <MiniCalendar
              citas={citas}
              fechaSeleccionada={
                fechaSeleccionada
              }
              onSeleccionarFecha={
                handleSeleccionarFechaMiniCal
              }
            />

            {/* LEYENDA */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">

              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-yellow-500" />

                <span className="font-bold text-gray-700 text-xs">
                  PENDIENTES
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-blue-500" />

                <span className="font-bold text-gray-700 text-xs">
                  CONFIRMADAS
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-green-600" />

                <span className="font-bold text-gray-700 text-xs">
                  COMPLETADAS
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-green-500" />

                <span className="font-bold text-gray-700 text-xs">
                  DISPONIBLES
                </span>
              </div>
            </div>
          </aside>

          {/* AGENDA */}
          <div className="flex-1 space-y-4">

            {/* NAVEGACIÓN */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

              <button
                type="button"
                onClick={
                  irSemanaAnterior
                }
                className="w-full sm:w-auto rounded-lg bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                ← Semana Anterior
              </button>

              <button
                type="button"
                onClick={
                  irAHoy
                }
                className="w-full sm:w-auto rounded-lg bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                Esta Semana
              </button>

              <button
                type="button"
                onClick={
                  irSemanaSiguiente
                }
                className="w-full sm:w-auto rounded-lg bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Semana Siguiente →
              </button>
            </div>

            {/* CARGANDO */}
            {cargando ? (
              <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-500">
                Cargando agenda...
              </div>
            ) : error ? (
              /* ERROR */
              <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center text-red-600">
                {error}
              </div>
            ) : (
              /* CALENDARIO */
              <AgendaCalendarGrid
                citas={citas}
                semanaInicio={
                  semanaInicio
                }
                onCancelarCita={
                  handleCancelarCita
                }
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}