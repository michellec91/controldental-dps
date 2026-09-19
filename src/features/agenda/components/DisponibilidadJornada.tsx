"use client";

import { Cita } from "../types/agenda.types";

interface DisponibilidadJornadaProps {
  fechaFiltro: string;
  citas: Cita[];
}

export function DisponibilidadJornada({ fechaFiltro, citas }: DisponibilidadJornadaProps) {
  if (!fechaFiltro) return null;

  const horariosHabiles = ["08:00", "09:00", "10:00", "10:30", "11:00", "14:00", "15:00", "16:00"];

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
      <h3 className="mb-3 text-sm font-bold text-blue-900">
        Disponibilidad de la jornada ({fechaFiltro}):
      </h3>
      <div className="flex flex-wrap gap-2">
        {horariosHabiles.map((h) => {
          const estaOcupado = citas.some(
            (c) => c.fecha === fechaFiltro && c.hora === h && c.estado !== "cancelada"
          );
          return (
            <span
              key={h}
              className={`rounded-md px-3 py-1 font-mono text-xs font-bold border ${
                estaOcupado
                  ? "bg-red-100 text-red-700 border-red-300"
                  : "bg-green-100 text-green-700 border-green-300"
              }`}
            >
              {h} {estaOcupado ? "(Ocupado)" : "(Disponible)"}
            </span>
          );
        })}
      </div>
    </div>
  );
}