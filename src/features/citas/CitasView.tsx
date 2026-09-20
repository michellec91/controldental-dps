"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { TarjetaCita } from "./components/TarjetaCita";
import { ModalAgendarCita } from "./components/ModalAgendarCita";
import { ModalReprogramarCita } from "./components/ModalReprogramarCita";
import { Cita } from "../agenda/types/agenda.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function CitasView() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [modalAgendarAbierto, setModalAgendarAbierto] = useState(false);
  const [citaAReprogramar, setCitaAReprogramar] = useState<Cita | null>(null);
  const [citaACancelar, setCitaACancelar] = useState<string | number | null>(null);

  const cargarCitas = async () => {
    try {
      const res = await fetch(`${API_URL}/citas`);
      if (res.ok) {
        const data = await res.json();
        setCitas(data);
      }
    } catch (err) {
      console.error("Error al cargar citas:", err);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  const handleCitaCreada = (nuevaCita: Cita) => {
    setCitas((prev) => [...prev, nuevaCita]);
  };

  const confirmarCancelarCita = async () => {
    if (!citaACancelar) return;

    try {
      const res = await fetch(`${API_URL}/citas/${citaACancelar}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "cancelada" }),
      });

      if (res.ok) {
        const citaActualizada = await res.json();
        setCitas((prev) =>
          prev.map((c) => (c.id === citaACancelar ? citaActualizada : c))
        );
      }
    } catch (err) {
      console.error("Error al cancelar cita:", err);
    } finally {
      setCitaACancelar(null);
    }
  };

  return (
    <>
      <Navbar /> {/* <-- Renderizamos el Navbar aquí */}
      <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
        <div className="container mx-auto max-w-6xl space-y-6">
          {/* Envoltorio Blanco Superior */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800">Gestión de Citas</h1>
              <p className="text-sm text-gray-500 mt-1">
                Agenda, reprograma o cancela tu cita médica.
              </p>
            </div>
            <button
              onClick={() => setModalAgendarAbierto(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all active:scale-95"
            >
              <span className="text-lg font-bold">+</span> Nueva Cita
            </button>
          </div>

          {/* Sección Principal de Citas */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-700">
              Citas Registradas ({citas.length})
            </h2>

            {citas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
                No hay citas registradas. Haz clic en <strong>"+ Nueva Cita"</strong> para agendar una.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {citas.map((cita) => (
                  <TarjetaCita
                    key={cita.id}
                    cita={cita}
                    onReprogramar={(c) => setCitaAReprogramar(c)}
                    onCancelar={(id) => setCitaACancelar(id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Modal de Nueva Cita */}
          <ModalAgendarCita
            isOpen={modalAgendarAbierto}
            onClose={() => setModalAgendarAbierto(false)}
            onCitaCreada={handleCitaCreada}
          />

          {/* Modal Reprogramar */}
          {citaAReprogramar && (
            <ModalReprogramarCita
              cita={citaAReprogramar}
              todasLasCitas={citas}
              onClose={() => setCitaAReprogramar(null)}
              onCitaActualizada={(actualizada) => {
                setCitas((prev) =>
                  prev.map((c) => (c.id === actualizada.id ? actualizada : c))
                );
                setCitaAReprogramar(null);
              }}
            />
          )}

          {/* Modal Cancelar */}
          {citaACancelar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4 text-center">
                <h3 className="text-lg font-bold text-gray-800">¿Cancelar esta cita?</h3>
                <p className="text-xs text-gray-500">
                  La cita cambiará a estado cancelado en el historial.
                </p>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setCitaACancelar(null)}
                    className="flex-1 rounded-xl border border-gray-300 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Volver
                  </button>
                  <button
                    onClick={confirmarCancelarCita}
                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700"
                  >
                    Sí, Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}