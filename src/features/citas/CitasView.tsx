"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { Cita } from "../agenda/types/agenda.types";
import { FormAgendarCita } from "./components/FormAgendarCita";
import { TarjetaCita } from "./components/TarjetaCita";
import { ModalReprogramarCita } from "./components/ModalReprogramarCita";

export function CitasView() {
  const [todasLasCitas, setTodasLasCitas] = useState<Cita[]>([]);
  const [citaAEditar, setCitaAEditar] = useState<Cita | null>(null);
  const [citaACancelar, setCitaACancelar] = useState<string | number | null>(null);

  const cargarCitas = async () => {
    try {
      const res = await fetch("http://localhost:3001/citas");
      const data = await res.json();
      setTodasLasCitas(data);
    } catch (err) {
      console.error("Error al cargar citas:", err);
    }
  };

  useEffect(() => {
    cargarCitas();
  }, []);

  const handleCitaCreada = (nuevaCita: Cita) => {
    setTodasLasCitas((prev) => [...prev, nuevaCita]);
  };

  const handleCitaActualizada = (citaActualizada: Cita) => {
    setTodasLasCitas((prev) =>
      prev.map((c) => (c.id === citaActualizada.id ? citaActualizada : c))
    );
  };

  const confirmarCancelarCita = async () => {
    if (!citaACancelar) return;

    try {
      const res = await fetch(`http://localhost:3001/citas/${citaACancelar}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "cancelada" }),
      });

      if (res.ok) {
        const citaActualizada = await res.json();
        setTodasLasCitas((prev) =>
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
      <Navbar />
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <header>
            <h1 className="text-3xl font-extrabold text-gray-800">Gestión de Citas</h1>
            <p className="text-sm text-gray-500">Agenda, reprograma o cancela tu cita médica.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de Alta */}
            <div className="lg:col-span-1">
              <FormAgendarCita
                todasLasCitas={todasLasCitas}
                onCitaCreada={handleCitaCreada}
              />
            </div>

            {/* Listado de Citas */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Citas Registradas</h2>
              {todasLasCitas.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 font-medium">
                  No hay citas agendadas aún.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todasLasCitas.map((cita) => (
                    <TarjetaCita
                      key={cita.id}
                      cita={cita}
                      onReprogramar={(c) => setCitaAEditar(c)}
                      onCancelar={(id) => setCitaACancelar(id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal de Reprogramación */}
        <ModalReprogramarCita
          cita={citaAEditar}
          todasLasCitas={todasLasCitas}
          onClose={() => setCitaAEditar(null)}
          onCitaActualizada={handleCitaActualizada}
        />

        {/* Modal de Confirmación para Cancelar Cita */}
        {citaACancelar !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-gray-800">¿Deseas cancelar esta cita?</h3>
              <p className="text-sm text-gray-600">
                Esta acción eliminará el registro de la cita de forma permanente.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCitaACancelar(null)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 transition-colors"
                >
                  No, mantener
                </button>
                <button
                  type="button"
                  onClick={confirmarCancelarCita}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  Sí, cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}