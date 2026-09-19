"use client";

import { useState } from "react";
import { Cita } from "../../agenda/types/agenda.types";

interface FormAgendarCitaProps {
  todasLasCitas: Cita[];
  onCitaCreada: (nuevaCita: Cita) => void;
}

export function FormAgendarCita({ todasLasCitas, onCitaCreada }: FormAgendarCitaProps) {
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [tratamientoNombre, setTratamientoNombre] = useState("Limpieza Dental");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("8:00 AM");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // Formato YYYY-MM-DD para el atributo 'min' del input tipo date
  const hoyString = new Date().toISOString().split("T")[0];

  const horasDisponibles = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 M",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setExito("");

    const nombreLimpio = pacienteNombre.trim();

    if (!nombreLimpio || !fecha) {
      setError("Por favor completa todos los campos requeridos.");
      return;
    }

    // 1. Validar que el nombre solo contenga letras, espacios, tildes y 'ñ'
    const regexSoloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!regexSoloLetras.test(nombreLimpio)) {
      setError("El nombre solo debe contener letras y espacios (sin números ni símbolos).");
      return;
    }

    // 2. Validar que la fecha no sea en el pasado
    const fechaSeleccionada = new Date(fecha + "T00:00:00");
    const hoySinHora = new Date();
    hoySinHora.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoySinHora) {
      setError("No puedes seleccionar una fecha que ya transcurrió.");
      return;
    }

    // 3. Validar Domingo
    if (fechaSeleccionada.getDay() === 0) {
      setError("La clínica no atiende los domingos. Elige otra fecha.");
      return;
    }

    // 4. Validar Sábado por la tarde
    if (
      fechaSeleccionada.getDay() === 6 &&
      ["1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"].includes(hora)
    ) {
      setError("Los sábados atendemos únicamente de 8:00 AM a 12:00 M.");
      return;
    }

    // 5. Validar si el horario ya está ocupado en la BD
    const estaOcupado = todasLasCitas.some(
      (c) => c.fecha === fecha && c.hora === hora && c.estado !== "cancelada"
    );

    if (estaOcupado) {
      setError(
        `⚠️ El horario de las ${hora} el día ${fecha} ya está ocupado. Por favor elige otro horario o fecha.`
      );
      return;
    }

    const nuevaCitaObj: Omit<Cita, "id"> = {
      pacienteNombre: nombreLimpio,
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
        const data = await res.json();
        onCitaCreada(data);
        setExito("¡Cita agendada con éxito!");
        setPacienteNombre("");
        setFecha("");
      } else {
        setError("Error al registrar la cita.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Agendar Nueva Cita</h2>

      {error && (
        <div className="rounded-xl bg-red-100 p-3 text-xs font-semibold text-red-700 border border-red-300">
          {error}
        </div>
      )}

      {exito && (
        <div className="rounded-xl bg-green-100 p-3 text-xs font-semibold text-green-700 border border-green-300">
          {exito}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Paciente</label>
          <input
            type="text"
            placeholder="Ej. Juan Pérez"
            value={pacienteNombre}
            onChange={(e) => setPacienteNombre(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Tratamiento</label>
          <select
            value={tratamientoNombre}
            onChange={(e) => setTratamientoNombre(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
              min={hoyString}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Hora</label>
            <select
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {horasDisponibles.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow hover:bg-blue-700 transition-colors"
        >
          Confirmar y Agendar Cita
        </button>
      </form>
    </div>
  );
}