"use client";

import { useState } from "react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Reprogramar Cita
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-xs font-semibold text-red-700 border border-red-300">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* TRATAMIENTO */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Tratamiento
            </label>

            <input
              type="text"
              value={
                cita.tratamiento_nombre
              }
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-100 p-2 text-sm text-gray-600"
            />
          </div>

          {/* FECHA */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nueva Fecha
            </label>

            <input
              type="date"
              value={
                nuevaFecha
              }
              onChange={(e) =>
                setNuevaFecha(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* HORA */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nueva Hora
            </label>

            <select
              value={
                nuevaHora
              }
              onChange={(e) =>
                setNuevaHora(
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              {horasDisponibles.map(
                (hora) => (
                  <option
                    key={
                      hora
                    }
                    value={
                      hora
                    }
                  >
                    {formatearHora(
                      hora
                    )}
                  </option>
                )
              )}
            </select>
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                guardando
              }
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                guardando
              }
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
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