"use client";

import { Cita } from "../types/agenda.types";

interface AgendaTablaProps {
  citasFiltradas: Cita[];
  cargando: boolean;
  verificarConflicto: (
    fechaCita: string,
    horaCita: string,
    idCita: string | number,
    estado: string
  ) => boolean;
}

export function AgendaTabla({
  citasFiltradas,
  cargando,
  verificarConflicto,
}: AgendaTablaProps) {
  return (
    <div className="rounded-xl bg-white shadow overflow-hidden">
      <div className="border-b p-6">
        <h2 className="text-xl font-bold text-gray-800">Citas Programadas</h2>
      </div>

      {cargando ? (
        <div className="p-8 text-center text-gray-500">Cargando citas desde la API REST...</div>
      ) : citasFiltradas.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No hay citas que coincidan con los filtros.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Tratamiento</th>
                <th className="px-6 py-4">Fecha / Hora</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Alertas</th>
              </tr>
            </thead>
            <tbody>
              {citasFiltradas.map((cita) => {
                const tieneConflicto = verificarConflicto(
                  cita.fecha,
                  cita.hora,
                  cita.id,
                  cita.estado
                );
                return (
                  <tr
                    key={cita.id}
                    className={`border-t transition-colors ${
                      tieneConflicto ? "bg-red-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {cita.pacienteNombre}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cita.tratamientoNombre}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {cita.fecha} — <span className="font-bold text-gray-800">{cita.hora}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                          cita.estado === "confirmada"
                            ? "bg-green-100 text-green-800"
                            : cita.estado === "pendiente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {cita.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {tieneConflicto ? (
                        <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white animate-pulse">
                          ⚠️ Conflicto de horario
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Sin empalme</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}