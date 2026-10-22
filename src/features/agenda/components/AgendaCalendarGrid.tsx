"use client";

import { Cita } from "../types/agenda.types";

interface AgendaCalendarGridProps {
  citas: Cita[];
  semanaInicio: Date;
  onCancelarCita: (id: number) => void;
}

export function AgendaCalendarGrid({
  citas,
  semanaInicio,
  onCancelarCita,
}: AgendaCalendarGridProps) {
  // -----------------------------------------
  // HORAS DE LA AGENDA
  // Formato compatible con MySQL
  // -----------------------------------------
  const horas = [
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

  const diasNombres = [
    "LUNES",
    "MARTES",
    "MIÉRCOLES",
    "JUEVES",
    "VIERNES",
    "SÁBADO",
    "DOMINGO",
  ];

  // -----------------------------------------
  // CREAR DÍAS DE LA SEMANA
  // -----------------------------------------
  const diasSemana =
    diasNombres.map(
      (nombre, idx) => {
        const d =
          new Date(
            semanaInicio
          );

        d.setDate(
          semanaInicio.getDate() +
            idx
        );

        const year =
          d.getFullYear();

        const month =
          String(
            d.getMonth() + 1
          ).padStart(2, "0");

        const day =
          String(
            d.getDate()
          ).padStart(2, "0");

        const fechaStr =
          `${year}-${month}-${day}`;

        return {
          nombre,
          numero:
            d.getDate(),
          fechaStr,
        };
      }
    );

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
  // 08:00:00 -> 08:00
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
  // MOSTRAR HORA
  // 13:00 -> 1:00 PM
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
  // COLOR SEGÚN ESTADO
  // -----------------------------------------
  const obtenerColorEstado = (
    estado: string
  ) => {
    switch (
      estado?.toLowerCase()
    ) {
      case "pendiente":
        return "bg-yellow-500";

      case "confirmada":
        return "bg-blue-500";

      case "completada":
        return "bg-green-600";

      case "cancelada":
        return "bg-red-500";

      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-8 gap-2 min-w-[900px]">

        {/* CABECERA HORA */}
        <div className="p-2 font-bold text-gray-400">
          Hora
        </div>

        {/* CABECERA DÍAS */}
        {diasSemana.map(
          (dia) => (
            <div
              key={
                dia.fechaStr
              }
              className="text-center font-bold text-gray-800 py-2 border-b"
            >
              <div>
                {dia.nombre}
              </div>

              <div className="text-sm font-normal text-gray-500">
                {dia.numero}
              </div>
            </div>
          )
        )}

        {/* FILAS DE HORAS */}
        {horas.map((hora) => (
          <div
            key={hora}
            className="contents"
          >
            {/* HORA */}
            <div className="flex items-center justify-center font-extrabold text-gray-700 text-xs py-3 border-b">
              {formatearHora(
                hora
              )}
            </div>

            {/* DÍAS */}
            {diasSemana.map(
              (dia) => {
                // ---------------------------
                // DOMINGO
                // ---------------------------
                if (
                  dia.nombre ===
                  "DOMINGO"
                ) {
                  return (
                    <div
                      key={`${dia.fechaStr}-${hora}`}
                      className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-[10px] text-gray-400 text-center flex items-center justify-center font-semibold"
                    >
                      No laborable
                    </div>
                  );
                }

                // ---------------------------
                // SÁBADO POR LA TARDE
                // ---------------------------
                const esSabadoTarde =
                  dia.nombre ===
                    "SÁBADO" &&
                  [
                    "13:00",
                    "14:00",
                    "15:00",
                    "16:00",
                    "17:00",
                  ].includes(
                    hora
                  );

                if (
                  esSabadoTarde
                ) {
                  return (
                    <div
                      key={`${dia.fechaStr}-${hora}`}
                      className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-[10px] text-gray-400 text-center flex items-center justify-center font-semibold"
                    >
                      Cerrado
                    </div>
                  );
                }

                // ---------------------------
                // BUSCAR CITA
                // Las canceladas NO ocupan
                // horario.
                // ---------------------------
                const cita =
                  citas.find(
                    (c) => {
                      const fechaCita =
                        normalizarFecha(
                          c.fecha
                        );

                      const horaCita =
                        normalizarHora(
                          c.hora
                        );

                      const activa =
                        c.estado?.toLowerCase() !==
                        "cancelada";

                      return (
                        fechaCita ===
                          dia.fechaStr &&
                        horaCita ===
                          hora &&
                        activa
                      );
                    }
                  );

                // ---------------------------
                // HAY CITA
                // ---------------------------
                if (cita) {
                  const nombrePaciente =
                    [
                      cita.paciente_nombre,
                      cita.paciente_apellido,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        " "
                      );

                  return (
                    <div
                      key={
                        cita.id_cita
                      }
                      className={`group relative rounded-lg p-2 flex flex-col justify-between text-white text-xs font-bold shadow-sm transition-all ${obtenerColorEstado(
                        cita.estado
                      )}`}
                    >
                      <div className="truncate">
                        👤{" "}
                        {nombrePaciente ||
                          "Paciente"}
                      </div>

                      <div className="text-[11px] font-normal truncate my-0.5">
                        🦷{" "}
                        {
                          cita.tratamiento_nombre
                        }
                      </div>

                      <div className="flex justify-between items-center text-[10px] gap-1">
                        <span className="uppercase font-extrabold truncate">
                          {
                            cita.estado
                          }
                        </span>

                        {cita.estado?.toLowerCase() !==
                          "completada" && (
                          <button
                            type="button"
                            onClick={() =>
                              onCancelarCita(
                                cita.id_cita
                              )
                            }
                            className="opacity-0 group-hover:opacity-100 bg-black/30 hover:bg-black/60 rounded px-1.5 py-0.5 text-[9px] transition-opacity"
                            title="Cancelar cita"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  );
                }

                // ---------------------------
                // HORARIO DISPONIBLE
                // ---------------------------
                return (
                  <div
                    key={`${dia.fechaStr}-${hora}`}
                    className="rounded-lg bg-green-500 border border-green-600 p-2 flex items-center justify-center text-xs font-extrabold text-white hover:bg-green-600 transition-colors"
                  >
                    DISPONIBLE
                  </div>
                );
              }
            )}
          </div>
        ))}
      </div>
    </div>
  );
}