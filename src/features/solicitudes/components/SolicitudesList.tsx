"use client";

import { useEffect, useState } from "react";
import { Cita, obtenerSolicitudesPendientes, actualizarEstadoCita } from "../../../services/citasService";
import Navbar from "../../../components/Navbar";
import { alertConfirm, alertSuccess } from "../../../lib/alert";

export default function SolicitudesList() {
  // Guarda las citas que obtenemos desde la API.
  const [citas, setCitas] = useState<Cita[]>([]);

  // Indica si estamos cargando las solicitudes.
  const [cargando, setCargando] = useState(true);

  // Guarda el mensaje cuando no se pueden cargar las solicitudes.
  const [error, setError] = useState("");

  // Carga las citas cuando el componente se muestra por primera vez.
  useEffect(() => {
    cargarCitas();
  }, []);

  // Consulta las citas y las guarda en el estado.
  async function cargarCitas() {
    setCargando(true);
    setError("");

    try {
      const datos = await obtenerSolicitudesPendientes();
      setCitas(datos);
    } catch (error) {
      console.error("Error al cargar las citas:", error);
      setError("No se pudieron cargar las solicitudes.");
    } finally {
      setCargando(false);
    }
  }

  // Confirma una solicitud y actualiza la lista.
  async function confirmarCita(id: string) {
    const confirmado = await alertConfirm({
      title: "¿Confirmar cita?",
    });

    if (!confirmado) {
      return;
    }

    await actualizarEstadoCita(id, "confirmada");
    await cargarCitas();

    alertSuccess("Cita confirmada");
  }

  // Rechaza una solicitud y actualiza la lista.
  async function rechazarCita(id: string) {
    const confirmado = await alertConfirm({
        title: "¿Rechazar cita?",
    });

    if (!confirmado) {
      return;
    }

    await actualizarEstadoCita(id, "rechazada");
    await cargarCitas();

    alertSuccess("Cita rechazada");
  }

  // Formatea la fecha para mostrarla de una forma más clara.
  function formatearFecha(fecha: string) {
    return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Solicitudes de Citas
          </h1>

          {error && (
            <p className="mt-4 text-red-600">
              {error}
            </p>
          )}

          {cargando ? (
            <p>Cargando solicitudes...</p>
          ) : citas.length === 0 ? (
            <p>No hay solicitudes pendientes.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {citas.map((cita) => (
                <div
                  key={cita.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
                >
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600">
                      Paciente
                    </p>
                    <p className="text-sm text-gray-900">
                      {cita.paciente}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600">
                      Tratamiento
                    </p>
                    <p className="text-sm text-gray-900">
                      {cita.tratamiento}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600">
                      Fecha
                    </p>
                    <p className="text-sm text-gray-900">
                      {formatearFecha(cita.fecha)}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600">
                      Hora
                    </p>
                    <p className="text-sm text-gray-900">
                      {cita.hora}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600">
                      Correo electrónico
                    </p>
                    <p className="text-sm text-gray-900">
                      {cita.correo}
                    </p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-600">
                      Teléfono
                    </p>
                    <p className="text-sm text-gray-900">
                      {cita.telefono}
                    </p>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => confirmarCita(cita.id)}
                      className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
                    >
                      Confirmar
                    </button>

                    <button
                      onClick={() => rechazarCita(cita.id)}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}