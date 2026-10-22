"use client";

import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";

import {
  Cita,
  obtenerCitas,
  actualizarEstadoCita,
} from "../../services/citasService";

import { TarjetaCita } from "./components/TarjetaCita";
import { ModalAgendarCita } from "./components/ModalAgendarCita";
import { ModalReprogramarCita } from "./components/ModalReprogramarCita";

import {
  alertError,
  alertSuccess,
} from "../../lib/alert";

export function CitasView() {
  const [citas, setCitas] =
    useState<Cita[]>([]);

  const [
    modalAgendarAbierto,
    setModalAgendarAbierto,
  ] = useState(false);

  const [
    citaAReprogramar,
    setCitaAReprogramar,
  ] = useState<Cita | null>(
    null
  );

  const [
    citaACancelar,
    setCitaACancelar,
  ] = useState<number | null>(
    null
  );

  const [
    cargando,
    setCargando,
  ] = useState(true);

  const [error, setError] =
    useState("");

  // -----------------------------------------
  // CARGAR CITAS
  // -----------------------------------------
  const cargarCitas =
    async () => {
      setCargando(true);
      setError("");

      try {
        const datos =
          await obtenerCitas();

        setCitas(datos);
      } catch (error) {
        console.error(
          "Error al cargar citas:",
          error
        );

        setError(
          "No se pudieron cargar las citas."
        );
      } finally {
        setCargando(false);
      }
    };

  useEffect(() => {
    cargarCitas();
  }, []);

  // -----------------------------------------
  // CITA CREADA
  // -----------------------------------------
  const handleCitaCreada =
    async () => {
      // Volvemos a consultar la API
      // para obtener también paciente,
      // tratamiento, correo, etc.
      await cargarCitas();

      setModalAgendarAbierto(
        false
      );
    };

  // -----------------------------------------
  // CANCELAR CITA
  // -----------------------------------------
  const confirmarCancelarCita =
    async () => {
      if (
        citaACancelar ===
        null
      ) {
        return;
      }

      try {
        await actualizarEstadoCita(
          citaACancelar,
          "Cancelada"
        );

        await cargarCitas();

        alertSuccess(
          "Cita cancelada"
        );
      } catch (error) {
        console.error(
          "Error al cancelar cita:",
          error
        );

        alertError(
          "Error",
          "No fue posible cancelar la cita."
        );
      } finally {
        setCitaACancelar(
          null
        );
      }
    };

  // -----------------------------------------
  // CITA REPROGRAMADA
  // -----------------------------------------
  const handleCitaActualizada =
    async () => {
      await cargarCitas();

      setCitaAReprogramar(
        null
      );
    };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
        <div className="container mx-auto max-w-6xl space-y-6">

          {/* CABECERA */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800">
                Gestión de Citas
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Administra las citas
                registradas de los
                pacientes.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setModalAgendarAbierto(
                  true
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition-all active:scale-95"
            >
              <span className="text-lg font-bold">
                +
              </span>

              Nueva Cita
            </button>
          </div>

          {/* LISTADO */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-700">
              Citas Registradas
              {!cargando &&
                ` (${citas.length})`}
            </h2>

            {cargando ? (
              <div className="p-12 text-center text-gray-500">
                Cargando citas...
              </div>
            ) : error ? (
              <div className="p-12 text-center text-red-600">
                {error}
              </div>
            ) : citas.length ===
              0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-400">
                No hay citas
                registradas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {citas.map(
                  (cita) => (
                    <TarjetaCita
                      key={
                        cita.id_cita
                      }
                      cita={cita}
                      onReprogramar={(
                        cita
                      ) =>
                        setCitaAReprogramar(
                          cita
                        )
                      }
                      onCancelar={(
                        id
                      ) =>
                        setCitaACancelar(
                          id
                        )
                      }
                    />
                  )
                )}
              </div>
            )}
          </div>

          {/* MODAL AGENDAR */}
          <ModalAgendarCita
            isOpen={
              modalAgendarAbierto
            }
            onClose={() =>
              setModalAgendarAbierto(
                false
              )
            }
            onCitaCreada={
              handleCitaCreada
            }
          />

          {/* MODAL REPROGRAMAR */}
          {citaAReprogramar && (
            <ModalReprogramarCita
              cita={
                citaAReprogramar
              }
              todasLasCitas={
                citas
              }
              onClose={() =>
                setCitaAReprogramar(
                  null
                )
              }
              onCitaActualizada={
                handleCitaActualizada
              }
            />
          )}

          {/* MODAL CANCELAR */}
          {citaACancelar !==
            null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4 text-center">
                <h3 className="text-lg font-bold text-gray-800">
                  ¿Cancelar esta
                  cita?
                </h3>

                <p className="text-xs text-gray-500">
                  La cita se
                  conservará en el
                  historial con
                  estado Cancelada.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCitaACancelar(
                        null
                      )
                    }
                    className="flex-1 rounded-xl border border-gray-300 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Volver
                  </button>

                  <button
                    type="button"
                    onClick={
                      confirmarCancelarCita
                    }
                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-700"
                  >
                    Sí, cancelar
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