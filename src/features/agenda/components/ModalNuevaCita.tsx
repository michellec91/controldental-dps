"use client";

import { useState } from "react";
import { Cita } from "../types/agenda.types";

interface ModalNuevaCitaProps {
  isOpen: boolean;
  onClose: () => void;
  citasActuales: Cita[];
  onCitaCreada: (nuevaCita: Cita) => void;
}

export function ModalNuevaCita({
  isOpen,
  onClose,
  citasActuales,
  onCitaCreada,
}: ModalNuevaCitaProps) {
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [tratamientoNombre, setTratamientoNombre] = useState("Limpieza Dental");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("8:00 AM");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const horasDisponibles = [
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!pacienteNombre.trim() || !fecha) {
      setError("Por favor completa todos los campos.");
      return;
    }

    const fechaObj = new Date(fecha + "T00:00:00");
    if (fechaObj.getDay() === 0) {
      setError("La clínica no atiende los días domingos. Elige otra fecha.");
      return;
    }

    if (
      fechaObj.getDay() === 6 &&
      ["1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"].includes(hora)
    ) {
      setError("Los sábados la clínica atiende solo de 8:00 AM a 12:00 M.");
      return;
    }

    const existeConflicto = citasActuales.some(
      (c) => c.fecha === fecha && c.hora === hora && c.estado !== "cancelada"
    );

    if (existeConflicto) {
      setError(
        `⚠️ El horario de las ${hora} para la fecha ${fecha} ya está ocupado. Por favor elige otra fecha u hora disponible.`
      );
      return;
    }

    const nuevaCitaObj: Omit<Cita, "id"> = {
      pacienteNombre,
      tratamientoNombre,
      fecha,
      hora,
      estado: "confirmada",
    };

    try {
      const res = await fetch("http://localhost:3001/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaCitaObj),
      });

      if (res.ok) {
        const dataGuardada = await res.json();
        onCitaCreada(dataGuardada);
        setPacienteNombre("");
        setFecha("");
        onClose();
      } else {
        setError("Error al guardar la cita en el servidor.");
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Agendar Nueva Cita</h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-xs font-semibold text-red-700 border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nombre del Paciente
            </label>
            <input
              type="text"
              placeholder="Ej. Carlos Pérez"
              value={pacienteNombre}
              onChange={(e) => setPacienteNombre(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Tratamiento
            </label>
            <select
              value={tratamientoNombre}
              onChange={(e) => setTratamientoNombre(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Limpieza Dental">Limpieza Dental</option>
              <option value="Rellenos">Rellenos</option>
              <option value="Ortodoncia">Ortodoncia</option>
              <option value="Extracción">Extracción</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Hora</label>
              <select
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {horasDisponibles.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            </div>
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
              Agendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}