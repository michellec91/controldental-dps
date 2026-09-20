"use client";

import { useState, useEffect } from "react";
import { Cita } from "../../agenda/types/agenda.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface FormAgendarCitaProps {
  onCitaCreada?: (cita: Cita) => void;
}

export function FormAgendarCita({ onCitaCreada }: FormAgendarCitaProps) {
  const [pacienteNombre, setPacienteNombre] = useState("");
  const [tratamientoNombre, setTratamientoNombre] = useState("Limpieza Dental");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("08:00 AM");
  const [errorNombre, setErrorNombre] = useState("");
  const [errorGeneral, setErrorGeneral] = useState("");
  const [citasExistentes, setCitasExistentes] = useState<Cita[]>([]);

  // Formato YYYY-MM-DD para la fecha mínima
  const hoy = new Date();
  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;

  // Cargar citas existentes para comprobar duplicados
  useEffect(() => {
    fetch(`${API_URL}/citas`)
      .then((res) => res.json())
      .then((data) => setCitasExistentes(data))
      .catch((err) => console.error("Error al obtener citas:", err));
  }, []);

  const normalizarHora = (h: string) =>
    h.trim().toUpperCase().replace(/^0/, "");

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    const regexSoloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;

    if (!regexSoloLetras.test(valor)) {
      setErrorNombre("El nombre solo puede contener letras y espacios.");
    } else {
      setErrorNombre("");
    }
    setPacienteNombre(valor);
    setErrorGeneral("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGeneral("");

    // 1. Validar nombre solo letras
    const regexSoloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!pacienteNombre.trim() || !regexSoloLetras.test(pacienteNombre.trim())) {
      setErrorNombre("El nombre solo puede contener letras y espacios.");
      return;
    }

    // 2. Validar fecha seleccionada
    if (!fecha) {
      setErrorGeneral("Por favor seleccione una fecha.");
      return;
    }

    // 3. Validar que no sea fecha anterior a la actual
    if (fecha < hoyStr) {
      setErrorGeneral("No se pueden agendar citas en fechas pasadas.");
      return;
    }

    // Parsear fecha seleccionada (evitando desfasaje UTC)
    const [year, month, day] = fecha.split("-").map(Number);
    const fechaObj = new Date(year, month - 1, day);
    const diaSemana = fechaObj.getDay(); // 0 = Domingo, 6 = Sábado

    // 4. Validar Domingo
    if (diaSemana === 0) {
      setErrorGeneral("La clínica no atiende los días domingo.");
      return;
    }

    // 5. Validar Sábado por la tarde (Solo 8:00 AM a 12:00 M)
    const horasTardeSabado = ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];
    if (diaSemana === 6 && horasTardeSabado.includes(hora)) {
      setErrorGeneral("Los sábados la clínica solo atiende de 8:00 AM a 12:00 M.");
      return;
    }

    // 6. Validar citas duplicadas en la misma fecha y hora (no canceladas)
    const ocupado = citasExistentes.some((c) => {
      const fechaCita = c.fecha.split("T")[0].trim();
      const esMismaFecha = fechaCita === fecha.trim();
      const esMismaHora = normalizarHora(c.hora) === normalizarHora(hora);
      const estaActiva = c.estado !== "cancelada";

      return esMismaFecha && esMismaHora && estaActiva;
    });

    if (ocupado) {
      setErrorGeneral("Ya existe una cita agendada para ese día y esa hora.");
      return;
    }

    const nuevaCita = {
      pacienteNombre: pacienteNombre.trim(),
      tratamientoNombre,
      fecha,
      hora,
      estado: "confirmada",
    };

    try {
      const res = await fetch(`${API_URL}/citas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaCita),
      });

      if (res.ok) {
        const data = await res.json();
        setPacienteNombre("");
        setFecha("");
        setErrorNombre("");
        setErrorGeneral("");
        if (onCitaCreada) onCitaCreada(data);
      }
    } catch (err) {
      setErrorGeneral("Error al conectar con el servidor.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">
          Nombre del Paciente
        </label>
        <input
          type="text"
          value={pacienteNombre}
          onChange={handleNombreChange}
          placeholder="Ej. Juan Pérez"
          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errorNombre && (
          <p className="mt-1 text-xs text-red-500 font-semibold">{errorNombre}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">
          Tratamiento
        </label>
        <select
          value={tratamientoNombre}
          onChange={(e) => setTratamientoNombre(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
        >
          <option value="Limpieza Dental">Limpieza Dental</option>
          <option value="Rellenos">Rellenos</option>
          <option value="Extracción">Extracción</option>
          <option value="Ortodoncia">Ortodoncia</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            min={hoyStr}
            value={fecha}
            onChange={(e) => {
              setFecha(e.target.value);
              setErrorGeneral("");
            }}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Hora
          </label>
          <select
            value={hora}
            onChange={(e) => {
              setHora(e.target.value);
              setErrorGeneral("");
            }}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
          >
            <option value="08:00 AM">08:00 AM</option>
            <option value="09:00 AM">09:00 AM</option>
            <option value="10:00 AM">10:00 AM</option>
            <option value="11:00 AM">11:00 AM</option>
            <option value="12:00 M">12:00 M</option>
            <option value="01:00 PM">01:00 PM</option>
            <option value="02:00 PM">02:00 PM</option>
            <option value="03:00 PM">03:00 PM</option>
            <option value="04:00 PM">04:00 PM</option>
            <option value="05:00 PM">05:00 PM</option>
          </select>
        </div>
      </div>

      {/* MENSAJE DE ERROR DENTRO DE LA WEB (Sin alert del navegador) */}
      {errorGeneral && (
        <div className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-600 border border-red-200">
          ⚠️ {errorGeneral}
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 transition-colors"
      >
        Confirmar y Agendar Cita
      </button>
    </form>
  );
}