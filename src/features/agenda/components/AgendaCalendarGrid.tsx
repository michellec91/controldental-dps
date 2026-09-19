"use client";

import { Cita } from "../types/agenda.types";

interface AgendaCalendarGridProps {
  citas: Cita[];
  semanaInicio: Date;
  onEliminarCita: (id: string | number) => void;
}

export function AgendaCalendarGrid({
  citas,
  semanaInicio,
  onEliminarCita,
}: AgendaCalendarGridProps) {
  const horas = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 M",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
  ];

  const diasNombres = [
    "LUNES",
    "MARTES",
    "MIÉRCOLES",
    "JUEVES",
    "VIERNES",
    "SÁBADO",
    "DOMINGO",
  ];

  const diasSemana = diasNombres.map((nombre, idx) => {
    const d = new Date(semanaInicio);
    d.setDate(semanaInicio.getDate() + idx);

    // Formatear en hora local YYYY-MM-DD sin desfase de zona horaria
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const fechaStr = `${year}-${month}-${day}`;

    return {
      nombre,
      numero: d.getDate(),
      fechaStr,
    };
  });

  // Función helper para limpiar la hora y comparar formatos (ej: "09:00 AM" vs "9:00 AM")
  const horasCoinciden = (horaCita: string, horaSlot: string) => {
    if (!horaCita) return false;

    // Normaliza eliminando el cero inicial (ej: "09:00 AM" -> "9:00 AM")
    const limpiar = (str: string) =>
      str
        .trim()
        .toUpperCase()
        .replace(/^0/, ""); // Quita el 0 del inicio si existe

    const hCita = limpiar(horaCita);
    const hSlot = limpiar(horaSlot);

    if (hCita === hSlot) return true;

    // Comparación fallback si la cita no guardó AM/PM (ej: "9:00" vs "9:00 AM")
    const soloHoraCita = hCita.replace(/(AM|PM|M)/g, "").trim();
    const soloHoraSlot = hSlot.replace(/(AM|PM|M)/g, "").trim();

    return soloHoraCita === soloHoraSlot;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-8 gap-2 min-w-[900px]">
        <div className="p-2 font-bold text-gray-400">Hora</div>
        {diasSemana.map((dia) => (
          <div
            key={dia.nombre}
            className="text-center font-bold text-gray-800 py-2 border-b"
          >
            <div>{dia.nombre}</div>
            <div className="text-sm font-normal text-gray-500">
              {dia.numero}
            </div>
          </div>
        ))}

        {horas.map((hora) => (
          <div key={hora} className="contents">
            <div className="flex items-center justify-center font-extrabold text-gray-700 text-xs py-3 border-b">
              {hora}
            </div>

            {diasSemana.map((dia) => {
              if (dia.nombre === "DOMINGO") {
                return (
                  <div
                    key={`${dia.fechaStr}-${hora}`}
                    className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-[10px] text-gray-400 text-center flex items-center justify-center font-semibold"
                  >
                    No laborable
                  </div>
                );
              }

              const esSabadoTarde =
                dia.nombre === "SÁBADO" &&
                ["1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"].includes(
                  hora
                );

              if (esSabadoTarde) {
                return (
                  <div
                    key={`${dia.fechaStr}-${hora}`}
                    className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-[10px] text-gray-400 text-center flex items-center justify-center font-semibold"
                  >
                    Cerrado
                  </div>
                );
              }

              // Buscamos la cita extrayendo solo YYYY-MM-DD y comparando horas de forma flexible
              const cita = citas.find((c) => {
                if (!c.fecha) return false;
                const fechaCitaLimpia = c.fecha.split("T")[0].trim();
                return (
                  fechaCitaLimpia === dia.fechaStr &&
                  horasCoinciden(c.hora, hora)
                );
              });

              if (cita) {
                const esConfirmada = cita.estado === "confirmada";
                return (
                  <div
                    key={cita.id}
                    className={`group relative rounded-lg p-2 flex flex-col justify-between text-white text-xs font-bold shadow-sm transition-all ${
                      esConfirmada ? "bg-blue-500" : "bg-red-500"
                    }`}
                  >
                    <div className="truncate">👤 {cita.pacienteNombre}</div>
                    <div className="text-[11px] font-normal truncate my-0.5">
                      🦷 {cita.tratamientoNombre}
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="uppercase font-extrabold">
                        {cita.estado}
                      </span>
                      <button
                        onClick={() => onEliminarCita(cita.id)}
                        className="opacity-0 group-hover:opacity-100 bg-black/30 hover:bg-black/60 rounded px-1.5 py-0.5 text-[9px] transition-opacity"
                        title="Eliminar registro definitivamente"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`${dia.fechaStr}-${hora}`}
                  className="rounded-lg bg-green-500 border border-green-600 p-2 flex items-center justify-center text-xs font-extrabold text-white hover:bg-green-600 transition-colors"
                >
                  DISPONIBLE
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}