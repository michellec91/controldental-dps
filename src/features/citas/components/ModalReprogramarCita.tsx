"use client";

import {
  useRef,
  useState,
} from "react";

import { FaRegCalendarAlt } from "react-icons/fa";

import { FaChevronDown } from "react-icons/fa";

import { Cita } from "../../../services/citasService";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

interface ModalReprogramarCitaProps {
  cita: Cita | null;
  todasLasCitas: Cita[];
  onClose: () => void;
  onCitaActualizada: () => void;
}

export function ModalReprogramarCita({
  cita,
  todasLasCitas,
  onClose,
  onCitaActualizada,
}: ModalReprogramarCitaProps) {
  const fechaInicial = cita?.fecha
    ? cita.fecha.includes("T")
      ? cita.fecha.split("T")[0]
      : cita.fecha
    : "";

  const horaInicial = cita?.hora
    ? cita.hora.slice(0, 5)
    : "08:00";

  const [nuevaFecha, setNuevaFecha] =
    useState(fechaInicial);

  const [nuevaHora, setNuevaHora] =
    useState(horaInicial);

  const [error, setError] =
    useState("");

  const [guardando, setGuardando] =
    useState(false);

  if (!cita) {
    return null;
  }

  const horasDisponibles = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  // -----------------------------------------
  // FORMATEAR HORA PARA MOSTRAR
  // -----------------------------------------
  const formatearHora = (
    hora: string
  ) => {
    const [horas, minutos] =
      hora.split(":");

    const numeroHora =
      Number(horas);

    if (numeroHora === 12) {
      return `12:${minutos} M`;
    }

    if (numeroHora > 12) {
      return `${
        numeroHora - 12
      }:${minutos} PM`;
    }

    return `${numeroHora}:${minutos} AM`;
  };

  // -----------------------------------------
  // NORMALIZAR FECHA
  // -----------------------------------------
  const normalizarFecha = (
    fecha: string
  ) => {
    if (!fecha) {
      return "";
    }

    return fecha.includes("T")
      ? fecha.split("T")[0]
      : fecha;
  };

  // -----------------------------------------
  // NORMALIZAR HORA
  // -----------------------------------------
  const normalizarHora = (
    hora: string
  ) => {
    if (!hora) {
      return "";
    }

    return hora.slice(0, 5);
  };

  // -----------------------------------------
  // REPROGRAMAR
  // -----------------------------------------
  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (
      !nuevaFecha ||
      !nuevaHora
    ) {
      setError(
        "Selecciona una fecha y una hora."
      );

      return;
    }

    const fechaObj =
      new Date(
        `${nuevaFecha}T00:00:00`
      );

    // Domingo
    if (
      fechaObj.getDay() === 0
    ) {
      setError(
        "La clínica no atiende los domingos. Elige otra fecha."
      );

      return;
    }

    // Sábado después del mediodía
    if (
      fechaObj.getDay() === 6 &&
      [
        "13:00",
        "14:00",
        "15:00",
        "16:00",
        "17:00",
      ].includes(nuevaHora)
    ) {
      setError(
        "Los sábados atendemos únicamente de 8:00 AM a 12:00 M."
      );

      return;
    }

    // Verificar horario ocupado
    const ocupado =
      todasLasCitas.some(
        (c) =>
          c.id_cita !==
            cita.id_cita &&
          normalizarFecha(
            c.fecha
          ) === nuevaFecha &&
          normalizarHora(
            c.hora
          ) === nuevaHora &&
          c.estado
            ?.toLowerCase() !==
            "cancelada"
      );

    if (ocupado) {
      setError(
        `El horario de las ${formatearHora(
          nuevaHora
        )} del ${nuevaFecha} ya está reservado. Selecciona otro horario.`
      );

      return;
    }

    try {
      setGuardando(true);

      const res =
        await fetch(
          `${API_URL}/citas/${cita.id_cita}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                id_tratamiento:
                  cita.id_tratamiento,
                fecha:
                  nuevaFecha,
                hora:
                  `${nuevaHora}:00`,
                estado:
                  "Confirmada",
              }),
          }
        );

      const data =
        await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            data.mensaje ||
            "No fue posible reprogramar la cita."
        );
      }

      await onCitaActualizada();

      onClose();
    } catch (err) {
      console.error(
        "Error al reprogramar cita:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Error de conexión."
      );
    } finally {
      setGuardando(false);
    }
  };

  const fechaInputRef =
  useRef<HTMLInputElement>(
    null
  );

  const abrirCalendario = () => {
    fechaInputRef.current?.showPicker?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div
        className="
          w-full
          max-w-md

          rounded-2xl

          bg-[var(--surface)]

          border
          border-[var(--border)]

          p-6

          shadow-2xl

          text-[var(--text)]
        "
      >
        {/* CABECERA */}
        <div
          className="
            mb-5

            border-b
            border-[var(--border)]

            pb-4
          "
        >
          <h2 className="text-xl font-bold text-[var(--text)]">
            Reprogramar Cita
          </h2>

          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Selecciona una nueva fecha y hora para la cita.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div
            className="
              mb-4

              rounded-lg

              bg-red-500/10

              p-3

              text-xs
              font-semibold
              text-red-400

              border
              border-red-500/30
            "
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* TRATAMIENTO */}
          <div>
            <label className="block text-xs font-bold text-[var(--text)] mb-2">
              Tratamiento
            </label>

            <input
              type="text"
              value={
                cita.tratamiento_nombre
              }
              disabled
              className="
                w-full

                rounded-lg

                border
                border-[var(--border)]

                bg-[var(--surface-soft)]

                p-2.5

                text-sm
                text-[var(--text-secondary)]

                opacity-80
              "
            />
          </div>

          {/* FECHA */}
          <div>
            <label className="block text-xs font-bold text-[var(--text)] mb-2">
              Nueva Fecha
            </label>

            <div className="relative">
              <input
                ref={fechaInputRef}
                type="date"
                value={nuevaFecha}
                onChange={(e) =>
                  setNuevaFecha(
                    e.target.value
                  )
                }
                className="
                  theme-date-input

                  w-full

                  rounded-lg

                  border
                  border-[var(--border)]

                  bg-[var(--input)]

                  py-2.5
                  pl-3
                  pr-11

                  text-sm
                  text-[var(--text)]

                  outline-none

                  focus:border-[var(--primary)]
                  focus:ring-2
                  focus:ring-[var(--primary)]

                  transition-colors
                "
                required
              />

              <button
                type="button"
                onClick={
                  abrirCalendario
                }
                aria-label="Abrir calendario"
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2

                  flex
                  h-8
                  w-8
                  items-center
                  justify-center

                  rounded-lg

                  text-[var(--text-secondary)]

                  hover:bg-[var(--primary-soft)]
                  hover:text-[var(--primary)]

                  transition-colors
                "
              >
                <FaRegCalendarAlt
                  size={16}
                />
              </button>
            </div>
          </div>

          {/* HORA */}
          <div>
            <label className="block text-xs font-bold text-[var(--text)] mb-2">
              Nueva Hora
            </label>

            <div className="relative">
              <select
                value={nuevaHora}
                onChange={(e) =>
                  setNuevaHora(
                    e.target.value
                  )
                }
                className="
                  w-full

                  appearance-none

                  rounded-lg

                  border
                  border-[var(--border)]

                  bg-[var(--input)]

                  py-2.5
                  pl-3
                  pr-12

                  text-sm
                  text-[var(--text)]

                  outline-none

                  focus:border-[var(--primary)]
                  focus:ring-2
                  focus:ring-[var(--primary)]

                  transition-colors
                "
                required
              >
                {horasDisponibles.map(
                  (hora) => (
                    <option
                      key={hora}
                      value={hora}
                    >
                      {formatearHora(
                        hora
                      )}
                    </option>
                  )
                )}
              </select>

              <FaChevronDown
                className="
                  pointer-events-none

                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2

                  text-[var(--text-secondary)]
                "
                size={13}
              />
            </div>
          </div>

          {/* BOTONES */}
          <div
            className="
              flex
              justify-end
              gap-3

              pt-5
              mt-2

              border-t
              border-[var(--border)]
            "
          >
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                guardando
              }
              className="
                rounded-lg

                border
                border-[var(--border)]

                bg-[var(--surface-soft)]

                px-4
                py-2.5

                text-sm
                font-semibold
                text-[var(--text)]

                hover:bg-[var(--surface-hover)]

                disabled:opacity-60
                disabled:cursor-not-allowed

                transition-colors
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                guardando
              }
              className="
                rounded-lg

                border
                border-[var(--primary)]

                bg-[var(--primary)]

                px-4
                py-2.5

                text-sm
                font-semibold
                text-white

                hover:bg-[var(--primary-dark)]
                hover:border-[var(--primary-dark)]

                disabled:opacity-60
                disabled:cursor-not-allowed

                transition-colors
              "
            >
              {guardando
                ? "Guardando..."
                : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}