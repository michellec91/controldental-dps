"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { Cita } from "./types/agenda.types";
import { AgendaCalendarGrid } from "./components/AgendaCalendarGrid";
import { MiniCalendar } from "./components/MiniCalendar";

export default function AgendaView() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date()); // Fecha seleccionada real (Hoy)

  // Función para obtener el lunes de cualquier fecha en hora local
  const getLunesSemana = (fecha: Date) => {
    const d = new Date(fecha);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const [semanaInicio, setSemanaInicio] = useState<Date>(() => getLunesSemana(new Date()));

  const cargarCitas = async () => {
    try {
      const res = await fetch("http://localhost:3001/citas");
      if (res.ok) {
        const data = await res.json();
        setCitas(data);
      }
    } catch (err) {
      console.error("Error al obtener citas:", err);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  const handleEliminarCita = async (id: string | number) => {
    if (!confirm("¿Deseas cancelar/eliminar esta cita?")) return;

    try {
      const res = await fetch(`http://localhost:3001/citas/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCitas((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Error al eliminar cita:", err);
    }
  };

  // Navegación por Semanas
  const irSemanaAnterior = () => {
    setSemanaInicio((prev) => {
      const nueva = new Date(prev);
      nueva.setDate(nueva.getDate() - 7);
      return nueva;
    });
  };

  const irSemanaSiguiente = () => {
    setSemanaInicio((prev) => {
      const nueva = new Date(prev);
      nueva.setDate(nueva.getDate() + 7);
      return nueva;
    });
  };

  const irAHoy = () => {
    const hoy = new Date();
    setFechaSeleccionada(hoy);
    setSemanaInicio(getLunesSemana(hoy));
    cargarCitas(); // Recargar citas al presionar "Esta Semana"
  };

  const handleSeleccionarFechaMiniCal = (fecha: Date) => {
    setFechaSeleccionada(fecha);
    setSemanaInicio(getLunesSemana(fecha));
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto flex max-w-7xl gap-6 flex-col md:flex-row">
          {/* Panel Izquierdo Admin */}
          <aside className="w-full md:w-64 space-y-6">
            <h1 className="text-3xl font-extrabold text-gray-800">AGENDA ADMIN</h1>

            <MiniCalendar
              citas={citas}
              fechaSeleccionada={fechaSeleccionada} // Pasar la fecha seleccionada en vez de semanaInicio
              onSeleccionarFecha={handleSeleccionarFechaMiniCal}
            />

            {/* Leyenda */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-blue-500"></span>
                <span className="font-bold text-gray-700 text-xs">CONFIRMADAS</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-red-500"></span>
                <span className="font-bold text-gray-700 text-xs">CANCELADAS</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 rounded-full bg-green-500"></span>
                <span className="font-bold text-gray-700 text-xs">DISPONIBLES</span>
              </div>
            </div>
          </aside>

          {/* Matriz Dinámica para el Administrador */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <button
                onClick={irSemanaAnterior}
                className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                ← Semana Anterior
              </button>

              <button
                onClick={irAHoy}
                className="rounded-lg bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors"
              >
                Esta Semana
              </button>

              <button
                onClick={irSemanaSiguiente}
                className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Semana Siguiente →
              </button>
            </div>

            <AgendaCalendarGrid
              citas={citas}
              semanaInicio={semanaInicio}
              onEliminarCita={handleEliminarCita}
            />
          </div>
        </div>
      </main>
    </>
  );
}