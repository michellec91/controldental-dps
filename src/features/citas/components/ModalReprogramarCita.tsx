"use client";

import { useState } from "react";
import { Cita } from "../../agenda/types/agenda.types";

interface ModalReprogramarCitaProps {
  cita: Cita | null;
  todasLasCitas: Cita[];
  onClose: () => void;
  onCitaActualizada: (citaActualizada: Cita) => void;
}

export function ModalReprogramarCita({
  cita,
  todasLasCitas,
  onClose,
  onCitaActualizada,
}: ModalReprogramarCitaProps) {
  const [nuevaFecha, setNuevaFecha] = useState(cita?.fecha || "");
  const [nuevaHora, setNuevaHora] = useState(cita?.hora || "8:00 AM");
  const [error, setError] = useState("");

  if (!cita) return null;

  const horasDisponibles = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 M",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar Domingo
    const fechaObj = new Date(nuevaFecha + "T00:00:00");
    if (fechaObj.getDay() === 0) {
      setError("La clínica no atiende los domingos. Elige otra fecha.");
      return;
    }

    // Validar Sábado por la tarde
    if (
      fechaObj.getDay() === 6 &&
      ["1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"].includes(nuevaHora)
    ) {
      setError("Los sábados atendemos únicamente de 8:00 AM a 12:00 M.");
      return;
    }

    // Validar si el nuevo horario ya está reservado por otra cita
    const ocupado = todasLasCitas.some(
      (c) =>
        c.id !== cita.id &&
        c.fecha === nuevaFecha &&
        c.hora === nuevaHora &&
        c.estado !== "cancelada"
    );

    if (ocupado) {
      setError(
        `⚠️ El horario de las ${nuevaHora} en la fecha ${nuevaFecha} ya está reservado. Selecciona otro horario.`
      );
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/citas/${cita.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: nuevaFecha,
          hora: nuevaHora,
          estado: "confirmada", // Reactiva la cita al reprogramarla
        }),
      });

      if (res.ok) {
        const data = await res.json();
        onCitaActualizada(data);
        onClose();
      } else {
        setError("Error al reprogramar la cita en el servidor.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Reprogramar Cita</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-xs font-semibold text-red-700 border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nueva Fecha</label>
            <input
              type="date"
              value={nuevaFecha}
              onChange={(e) => setNuevaFecha(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nueva Hora</label>
            <select
              value={nuevaHora}
              onChange={(e) => setNuevaHora(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {horasDisponibles.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}