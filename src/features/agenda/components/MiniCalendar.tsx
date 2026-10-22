"use client";

import { useState } from "react";
import { Cita } from "../types/agenda.types";

interface MiniCalendarProps {
  fechaSeleccionada?: Date;
  citas?: Cita[];
  onSeleccionarFecha?: (
    fecha: Date
  ) => void;
}

export function MiniCalendar({
  fechaSeleccionada =
    new Date(),
  citas = [],
  onSeleccionarFecha,
}: MiniCalendarProps) {
  const [
    mesActual,
    setMesActual,
  ] = useState(
    new Date(
      fechaSeleccionada.getFullYear(),
      fechaSeleccionada.getMonth(),
      1
    )
  );

  const diasSemana = [
    "L",
    "M",
    "M",
    "J",
    "V",
    "S",
    "D",
  ];

  const primerDiaMes =
    new Date(
      mesActual.getFullYear(),
      mesActual.getMonth(),
      1
    );

  const ultimoDiaMes =
    new Date(
      mesActual.getFullYear(),
      mesActual.getMonth() + 1,
      0
    );

  let diaInicioSemana =
    primerDiaMes.getDay() - 1;

  if (
    diaInicioSemana === -1
  ) {
    diaInicioSemana = 6;
  }

  const totalDias =
    ultimoDiaMes.getDate();

  const diasArreglo =
    Array.from(
      {
        length: totalDias,
      },
      (_, i) => i + 1
    );

  const espaciosBlancos =
    Array.from(
      {
        length:
          diaInicioSemana,
      },
      (_, i) => i
    );

  const mesesNombres = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];

  // -----------------------------------------
  // CAMBIAR MES
  // -----------------------------------------
  const cambiarMes = (
    delta: number
  ) => {
    setMesActual(
      new Date(
        mesActual.getFullYear(),
        mesActual.getMonth() +
          delta,
        1
      )
    );
  };

  // -----------------------------------------
  // SELECCIONAR DÍA
  // -----------------------------------------
  const seleccionarDia = (
    dia: number
  ) => {
    const nuevaFecha =
      new Date(
        mesActual.getFullYear(),
        mesActual.getMonth(),
        dia
      );

    if (
      onSeleccionarFecha
    ) {
      onSeleccionarFecha(
        nuevaFecha
      );
    }
  };

  // -----------------------------------------
  // NORMALIZAR FECHA MYSQL
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

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      {/* MES / AÑO */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-700">
          {
            mesesNombres[
              mesActual.getMonth()
            ]
          }{" "}
          {
            mesActual.getFullYear()
          }
        </span>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() =>
              cambiarMes(-1)
            }
            className="rounded p-1 text-xs font-bold text-gray-500 hover:bg-gray-100"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() =>
              cambiarMes(1)
            }
            className="rounded p-1 text-xs font-bold text-gray-500 hover:bg-gray-100"
          >
            →
          </button>
        </div>
      </div>

      {/* DÍAS SEMANA */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400">
        {diasSemana.map(
          (dia, index) => (
            <div
              key={index}
            >
              {dia}
            </div>
          )
        )}
      </div>

      {/* DÍAS MES */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {espaciosBlancos.map(
          (_, index) => (
            <div
              key={`blank-${index}`}
            />
          )
        )}

        {diasArreglo.map(
          (dia) => {
            const mes =
              String(
                mesActual.getMonth() +
                  1
              ).padStart(
                2,
                "0"
              );

            const diaStr =
              String(
                dia
              ).padStart(
                2,
                "0"
              );

            const fechaCeldaStr =
              `${mesActual.getFullYear()}-${mes}-${diaStr}`;

            // Citas activas del día
            const tieneCitas =
              citas.some(
                (cita) =>
                  normalizarFecha(
                    cita.fecha
                  ) ===
                    fechaCeldaStr &&
                  cita.estado
                    ?.toLowerCase() !==
                    "cancelada"
              );

            const esSeleccionada =
              fechaSeleccionada.getDate() ===
                dia &&
              fechaSeleccionada.getMonth() ===
                mesActual.getMonth() &&
              fechaSeleccionada.getFullYear() ===
                mesActual.getFullYear();

            return (
              <button
                type="button"
                key={dia}
                onClick={() =>
                  seleccionarDia(
                    dia
                  )
                }
                className={`relative rounded-lg py-1 font-semibold transition-colors ${
                  esSeleccionada
                    ? "bg-blue-600 text-white font-bold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {dia}

                {tieneCitas &&
                  !esSeleccionada && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-blue-500" />
                  )}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}