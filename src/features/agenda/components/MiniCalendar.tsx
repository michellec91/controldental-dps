"use client";

import { useState } from "react";
import { Cita } from "../types/agenda.types";

interface MiniCalendarProps {
  fechaSeleccionada?: Date;
  citas?: Cita[];
  onSeleccionarFecha?: (fecha: Date) => void;
}

export function MiniCalendar({
  fechaSeleccionada = new Date(),
  citas = [],
  onSeleccionarFecha,
}: MiniCalendarProps) {
  const [mesActual, setMesActual] = useState(
    new Date(fechaSeleccionada.getFullYear(), fechaSeleccionada.getMonth(), 1)
  );

  const diasSemana = ["L", "M", "M", "J", "V", "S", "D"];

  const primerDiaMes = new Date(
    mesActual.getFullYear(),
    mesActual.getMonth(),
    1
  );
  const ultimoDiaMes = new Date(
    mesActual.getFullYear(),
    mesActual.getMonth() + 1,
    0
  );

  let diaInicioSemana = primerDiaMes.getDay() - 1;
  if (diaInicioSemana === -1) diaInicioSemana = 6;

  const totalDias = ultimoDiaMes.getDate();
  const diasArreglo = Array.from({ length: totalDias }, (_, i) => i + 1);
  const espaciosBlancos = Array.from({ length: diaInicioSemana }, (_, i) => i);

  const cambiarMes = (delta: number) => {
    setMesActual(
      new Date(mesActual.getFullYear(), mesActual.getMonth() + delta, 1)
    );
  };

  const seleccionarDia = (dia: number) => {
    const nuevaFecha = new Date(
      mesActual.getFullYear(),
      mesActual.getMonth(),
      dia
    );
    if (onSeleccionarFecha) {
      onSeleccionarFecha(nuevaFecha);
    }
  };

  const mesesNombres = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
  ];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
      {/* Encabezado Mes / Año */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-700">
          {mesesNombres[mesActual.getMonth()]} {mesActual.getFullYear()}
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => cambiarMes(-1)}
            className="rounded p-1 text-xs font-bold text-gray-500 hover:bg-gray-100"
          >
            ←
          </button>
          <button
            onClick={() => cambiarMes(1)}
            className="rounded p-1 text-xs font-bold text-gray-500 hover:bg-gray-100"
          >
            →
          </button>
        </div>
      </div>

      {/* Días de la Semana */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-400">
        {diasSemana.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      {/* Días del Mes */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {espaciosBlancos.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {diasArreglo.map((dia) => {
          // Formatear la fecha del celda actual (YYYY-MM-DD)
          const m = String(mesActual.getMonth() + 1).padStart(2, "0");
          const dStr = String(dia).padStart(2, "0");
          const fechaCeldaStr = `${mesActual.getFullYear()}-${m}-${dStr}`;

          // Saber si hay citas activas o canceladas en este día
          const tieneCitas = citas.some((c) => c.fecha === fechaCeldaStr);

          // Saber si es el inicio de la semana visible en la matriz grande
          const esInicioSemanaVisible =
            fechaSeleccionada.getDate() === dia &&
            fechaSeleccionada.getMonth() === mesActual.getMonth() &&
            fechaSeleccionada.getFullYear() === mesActual.getFullYear();

          return (
            <button
              key={dia}
              onClick={() => seleccionarDia(dia)}
              className={`relative rounded-lg py-1 font-semibold transition-colors ${
                esInicioSemanaVisible
                  ? "bg-blue-600 text-white font-bold"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {dia}
              {/* Indicador visual (punto) si hay citas ese día */}
              {tieneCitas && !esInicioSemanaVisible && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-blue-500"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}