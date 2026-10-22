"use client";

import { Cita } from "../../../services/citasService";

interface TarjetaCitaProps {
  cita: Cita;
  onReprogramar: (cita: Cita) => void;
  onCancelar: (id: number) => void;
}

export function TarjetaCita({
  cita,
  onReprogramar,
  onCancelar,
}: TarjetaCitaProps) {
  // -----------------------------------------
  // ESTADOS
  // -----------------------------------------
  const estado =
    cita.estado?.toLowerCase() || "";

  const esCancelada =
    estado === "cancelada";

  const esPendiente =
    estado === "pendiente";

  const esConfirmada =
    estado === "confirmada";

  const esCompletada =
    estado === "completada";

  // -----------------------------------------
  // COLOR SEGÚN ESTADO
  // -----------------------------------------
  const getBadgeColor = () => {
    if (esCancelada) {
      return "bg-red-100 text-red-700 border-red-200";
    }

    if (esPendiente) {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }

    if (esCompletada) {
      return "bg-green-100 text-green-700 border-green-200";
    }

    if (esConfirmada) {
      return "bg-blue-100 text-blue-700 border-blue-200";
    }

    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  // -----------------------------------------
  // FORMATEAR FECHA
  // -----------------------------------------
  const formatearFecha = (
    fecha: string
  ) => {
    if (!fecha) {
      return "-";
    }

    const fechaLimpia =
      fecha.includes("T")
        ? fecha.split("T")[0]
        : fecha;

    return new Date(
      `${fechaLimpia}T00:00:00`
    ).toLocaleDateString(
      "es-ES",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  // -----------------------------------------
  // FORMATEAR HORA
  // -----------------------------------------
  const formatearHora = (
    hora: string
  ) => {
    if (!hora) {
      return "-";
    }

    const horaLimpia =
      hora.slice(0, 5);

    const [
      horas,
      minutos,
    ] =
      horaLimpia.split(":");

    const numeroHora =
      Number(horas);

    if (numeroHora === 0) {
      return `12:${minutos} AM`;
    }

    if (numeroHora === 12) {
      return `12:${minutos} PM`;
    }

    if (numeroHora > 12) {
      return `${
        numeroHora - 12
      }:${minutos} PM`;
    }

    return `${numeroHora}:${minutos} AM`;
  };

  // -----------------------------------------
  // NOMBRE COMPLETO DEL PACIENTE
  // -----------------------------------------
  const nombrePaciente =
    [
      cita.paciente_nombre,
      cita.paciente_apellido,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  // -----------------------------------------
  // NOMBRE DEL TRATAMIENTO
  // -----------------------------------------
  const nombreTratamiento =
    cita.tratamiento_nombre?.trim() ||
    "Sin tratamiento";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">

      {/* ESTADO */}
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold border uppercase ${getBadgeColor()}`}
        >
          {cita.estado}
        </span>
      </div>

      {/* INFORMACIÓN */}
      <div className="text-sm text-gray-600 space-y-2">

        {/* PACIENTE */}
        <p>
          <strong className="text-gray-700">
            👤 Paciente:
          </strong>{" "}
          {nombrePaciente ||
            "Sin nombre"}
        </p>

        {/* TRATAMIENTO */}
        <p>
          <strong className="text-gray-700">
            🦷 Tratamiento:
          </strong>{" "}
          {nombreTratamiento}
        </p>

        {/* FECHA */}
        <p>
          <strong className="text-gray-700">
            📅 Fecha:
          </strong>{" "}
          {formatearFecha(
            cita.fecha
          )}
        </p>

        {/* HORA */}
        <p>
          <strong className="text-gray-700">
            ⏰ Hora:
          </strong>{" "}
          {formatearHora(
            cita.hora
          )}
        </p>
      </div>

      {/* ACCIONES */}
      <div className="flex justify-end gap-2 pt-2">

        {!esCancelada &&
          !esCompletada && (
            <button
              type="button"
              onClick={() =>
                onReprogramar(
                  cita
                )
              }
              className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow hover:bg-amber-600 transition-colors"
            >
              Reprogramar
            </button>
          )}

        {!esCancelada &&
          !esCompletada && (
            <button
              type="button"
              onClick={() =>
                onCancelar(
                  cita.id_cita
                )
              }
              className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-red-700 transition-colors"
            >
              Cancelar
            </button>
          )}

      </div>
    </div>
  );
}