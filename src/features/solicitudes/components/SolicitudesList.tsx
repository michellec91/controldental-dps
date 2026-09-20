"use client";

import { useEffect, useState } from "react";
import { Cita, obtenerCitas, actualizarEstadoCita } from "../../../services/citasService";
import Navbar from "../../../components/Navbar";
import { alertConfirm, alertSuccess } from "../../../lib/alert";

export default function SolicitudesList() {
    // Guarda las citas que obtenemos desde la API.
    const [citas, setCitas] = useState<Cita[]>([]);

    // Indica si estamos cargando las solicitudes.
    const [cargando, setCargando] = useState(true);

    // Guarda el mensaje cuando no se pueden cargar las solicitudes.
    const [error, setError] = useState("");

    // Guarda el estado seleccionado en el filtro.
    const [filtroEstado, setFiltroEstado] = useState("pendiente");

    // Carga las citas cuando el componente se muestra por primera vez.
    useEffect(() => {
        cargarCitas();
    }, []);

    // Consulta las citas y las guarda en el estado.
    async function cargarCitas() {
        setCargando(true);
        setError("");

        try {
            const datos = await obtenerCitas();
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

    // Devuelve el estilo visual según el estado de la cita.
    function obtenerEstiloEstado(estado: string) {
        if (estado === "pendiente") {
            return "bg-yellow-100 text-yellow-800";
        }

        if (estado === "confirmada") {
            return "bg-green-100 text-green-800";
        }

        return "bg-red-100 text-red-800";
    }

    // Filtra las citas según el estado seleccionado.
    const citasFiltradas = citas.filter((cita) => {
        if (filtroEstado === "todas") {
            return true;
        }

        return cita.estado === filtroEstado;
    });

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Solicitudes de Citas
                    </h1>

                    {/* Permite filtrar las solicitudes por estado. */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado
                        </label>

                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full sm:w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-sky-500"
                        >
                            <option value="pendiente">Pendientes</option>
                            <option value="confirmada">Confirmadas</option>
                            <option value="rechazada">Rechazadas</option>
                            <option value="todas">Todas</option>
                        </select>
                    </div>

                    {/* Muestra un mensaje mientras se consultan las solicitudes. */}
                    {cargando ? (
                        <div className="flex justify-center items-center py-16">
                            <p className="text-gray-600 text-base font-medium">
                                Cargando solicitudes...
                            </p>
                        </div>
                    ) : error ? (
                        /* Muestra el error si no se pudo consultar la API. */
                        <div className="flex justify-center items-center py-16">
                            <p className="text-red-600 text-base font-medium">
                                {error}
                            </p>
                        </div>
                    ) : citasFiltradas.length === 0 ? (
                        /* Muestra este mensaje cuando el filtro no encuentra solicitudes. */
                        <div className="flex justify-center items-center py-16">
                            <p className="text-gray-500 text-base">
                                No hay solicitudes para mostrar.
                            </p>
                        </div>
                    ) : (
                        /* Muestra las solicitudes encontradas en tarjetas. */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                            {citasFiltradas.map((cita) => (
                                <div
                                    key={cita.id}
                                    className="bg-white border border-gray-200 rounded-xl shadow-sm p-4"
                                >
                                    {/* Muestra visualmente el estado de la cita. */}
                                    <div className="mb-4">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${obtenerEstiloEstado(
                                                cita.estado
                                            )}`}
                                        >
                                            {cita.estado.charAt(0).toUpperCase() +
                                                cita.estado.slice(1)}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-sm font-semibold text-gray-600">
                                            Paciente
                                        </p>
                                        <p className="text-sm text-gray-900">
                                            {cita.pacienteNombre}
                                        </p>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-sm font-semibold text-gray-600">
                                            Tratamiento
                                        </p>
                                        <p className="text-sm text-gray-900">
                                            {cita.tratamientoNombre}
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

                                    {/* Solo permite acciones mientras la solicitud esté pendiente. */}
                                    {cita.estado === "pendiente" && (
                                        <div className="flex gap-2 mt-6">
                                            <button
                                                onClick={() =>
                                                    confirmarCita(cita.id)
                                                }
                                                className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors"
                                            >
                                                Confirmar
                                            </button>

                                            <button
                                                onClick={() =>
                                                    rechazarCita(cita.id)
                                                }
                                                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}