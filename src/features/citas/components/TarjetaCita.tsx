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
      return "bg-red-500/15 text-red-400 border-red-500/30";
    }

    if (esPendiente) {
      return "bg-yellow-500/15 text-yellow-500 border-yellow-500/30";
    }

    if (esCompletada) {
      return "bg-green-500/15 text-green-500 border-green-500/30";
    }

    if (esConfirmada) {
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    }

    return "bg-slate-500/15 text-[var(--text-secondary)] border-[var(--border)]";
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
    <div
      className="
        rounded-2xl
        border
        border-[var(--border)]
        bg-[var(--surface-soft)]
        p-5
        shadow-sm
        space-y-4
        transition-colors
      "
    >
      {/* ESTADO */}
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold border uppercase ${getBadgeColor()}`}
        >
          {cita.estado}
        </span>
      </div>

      {/* INFORMACIÓN */}
      <div className="text-sm text-[var(--text-secondary)] space-y-3">

        {/* PACIENTE */}
        <p>
          <strong className="text-[var(--text)]">
            👤 Paciente:
          </strong>{" "}
          {nombrePaciente ||
            "Sin nombre"}
        </p>

        {/* TRATAMIENTO */}
        <p>
          <strong className="text-[var(--text)]">
            🦷 Tratamiento:
          </strong>{" "}
          {nombreTratamiento}
        </p>

        {/* FECHA */}
        <p>
          <strong className="text-[var(--text)]">
            📅 Fecha:
          </strong>{" "}
          {formatearFecha(
            cita.fecha
          )}
        </p>

        {/* HORA */}
        <p>
          <strong className="text-[var(--text)]">
            ⏰ Hora:
          </strong>{" "}
          {formatearHora(
            cita.hora
          )}
        </p>
      </div>

      {/* ACCIONES */}
      {!esCancelada &&
        !esCompletada && (
          <div
            className="
              flex
              justify-end
              gap-2
              pt-4
              border-t
              border-[var(--border)]
            "
          >
            <button
              type="button"
              onClick={() =>
                onReprogramar(
                  cita
                )
              }
              className="
                rounded-lg
                bg-amber-500/15
                border
                border-amber-500/30
                px-4
                py-2
                text-xs
                font-bold
                text-amber-500
                hover:bg-amber-500/25
                transition-colors
              "
            >
              Reprogramar
            </button>

            <button
              type="button"
              onClick={() =>
                onCancelar(
                  cita.id_cita
                )
              }
              className="
                rounded-lg
                bg-red-500/15
                border
                border-red-500/30
                px-4
                py-2
                text-xs
                font-bold
                text-red-400
                hover:bg-red-500/25
                transition-colors
              "
            >
              Cancelar
            </button>
          </div>
        )}
    </div>
  );
}