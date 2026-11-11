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

      <main className="min-h-screen bg-[var(--background)] text-[var(--text)] p-6 transition-colors">
        <div className="mx-auto flex max-w-7xl gap-6 flex-col md:flex-row">

          {/* PANEL IZQUIERDO */}
          <aside className="w-full md:w-64 space-y-6">
            <h1 className="text-3xl font-extrabold text-[var(--text)]">
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
            <div
              className="
                rounded-xl
                border
                border-[var(--border)]
                bg-[var(--surface)]
                p-4
                shadow-sm
                space-y-3
              "
            >
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-yellow-500" />

                <span className="font-bold text-[var(--text)] text-xs">
                  PENDIENTES
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-blue-500" />

                <span className="font-bold text-[var(--text)] text-xs">
                  CONFIRMADAS
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-green-600" />

                <span className="font-bold text-[var(--text)] text-xs">
                  COMPLETADAS
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-green-500" />

                <span className="font-bold text-[var(--text)] text-xs">
                  DISPONIBLES
                </span>
              </div>
            </div>
          </aside>

          {/* AGENDA */}
          <div className="flex-1 space-y-4">

            {/* NAVEGACIÓN */}
            <div
              className="
                flex
                flex-col
                sm:flex-row
                items-center
                justify-between
                gap-3

                rounded-xl

                border
                border-[var(--border)]

                bg-[var(--surface)]

                p-4
                shadow-sm
              "
            >
              {/* SEMANA ANTERIOR */}
              <button
                type="button"
                onClick={
                  irSemanaAnterior
                }
                className="
                  w-full
                  sm:w-auto

                  rounded-lg

                  border
                  border-[var(--border)]

                  bg-[var(--surface-soft)]

                  px-4
                  py-2

                  text-xs
                  font-bold
                  text-[var(--text)]

                  hover:bg-[var(--surface-hover)]

                  transition-colors
                "
              >
                ← Semana Anterior
              </button>

              {/* ESTA SEMANA */}
              <button
                type="button"
                onClick={
                  irAHoy
                }
                className="
                  w-full
                  sm:w-auto

                  rounded-lg

                  bg-[var(--primary-soft)]

                  px-4
                  py-2

                  text-xs
                  font-bold
                  text-[var(--primary)]

                  hover:bg-[var(--surface-hover)]

                  border
                  border-[var(--primary)]

                  transition-colors
                "
              >
                Esta Semana
              </button>

              {/* SEMANA SIGUIENTE */}
              <button
                type="button"
                onClick={
                  irSemanaSiguiente
                }
                className="
                  w-full
                  sm:w-auto

                  rounded-lg

                  border
                  border-[var(--border)]

                  bg-[var(--surface-soft)]

                  px-4
                  py-2

                  text-xs
                  font-bold
                  text-[var(--text)]

                  hover:bg-[var(--surface-hover)]

                  transition-colors
                "
              >
                Semana Siguiente →
              </button>
            </div>

            {/* CARGANDO */}
            {cargando ? (
              <div
                className="
                  rounded-xl

                  border
                  border-[var(--border)]

                  bg-[var(--surface)]

                  p-12

                  text-center
                  text-[var(--text-secondary)]
                "
              >
                Cargando agenda...
              </div>

            ) : error ? (

              /* ERROR */
              <div
                className="
                  rounded-xl

                  border
                  border-red-500/30

                  bg-red-500/10

                  p-12

                  text-center
                  text-red-400
                "
              >
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