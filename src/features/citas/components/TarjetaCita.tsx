"use client";

import { Cita } from "../../agenda/types/agenda.types";

interface TarjetaCitaProps {
  cita: Cita;
  onReprogramar: (cita: Cita) => void;
  onCancelar: (id: string | number) => void;
}

export function TarjetaCita({ cita, onReprogramar, onCancelar }: TarjetaCitaProps) {
  const esCancelada = cita.estado === "cancelada";

  const getBadgeColor = () => {
    if (esCancelada) {
      return "bg-red-100 text-red-700 border-red-200";
    }
    return "bg-blue-100 text-blue-700 border-blue-200";
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold border uppercase ${getBadgeColor()}`}
        >
          {cita.estado}
        </span>
      </div>

      <h3 className="text-xl font-bold text-gray-800">{cita.tratamientoNombre}</h3>

      <div className="text-sm text-gray-600 space-y-1">
        <p>
          <strong className="text-gray-700">📅 Fecha:</strong> {cita.fecha}
        </p>
        <p>
          <strong className="text-gray-700">⏰ Hora:</strong> {cita.hora}
        </p>
        <p>
          <strong className="text-gray-700">👤 Paciente:</strong> {cita.pacienteNombre}
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => onReprogramar(cita)}
          className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-600 transition-colors"
        >
          Reprogramar
        </button>

        {!esCancelada && (
          <button
            type="button"
            onClick={() => onCancelar(cita.id)}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-red-700 transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}