"use client";

import { useEffect, useState } from "react";
import { Cita, obtenerSolicitudesPendientes, actualizarEstadoCita } from "../../../services/citasService";

export default function SolicitudesList() {
  // Guarda las citas que obtenemos desde la API.
  const [citas, setCitas] = useState<Cita[]>([]);

  // Carga las citas cuando el componente se muestra por primera vez.
  useEffect(() => {
    cargarCitas();
  }, []);

  // Consulta las citas y las guarda en el estado.
  async function cargarCitas() {
    const datos = await obtenerSolicitudesPendientes();
    setCitas(datos);
  }

  // Confirma una solicitud y actualiza la lista.
  async function confirmarCita(id: string) {
    await actualizarEstadoCita(id, "confirmada");
    cargarCitas();
  }

  // Rechaza una solicitud y actualiza la lista.
  async function rechazarCita(id: string) {
    await actualizarEstadoCita(id, "rechazada");
    cargarCitas();
  }

  return (
    <div>
        <h1>Solicitudes de citas</h1>

        {citas.length === 0 ? (
            <p>No hay solicitudes pendientes.</p>
        ) : (
        citas.map((cita) => (
            <div key={cita.id}>
                <h2>{cita.paciente}</h2>
                <p>Tratamiento: {cita.tratamiento}</p>
                <p>Fecha: {cita.fecha}</p>
                <p>Hora: {cita.hora}</p>
                <p>Estado: {cita.estado}</p>
                
                <div>
                    <button onClick={() => confirmarCita(cita.id)}>Confirmar</button>
                    <button onClick={() => rechazarCita(cita.id)}>Rechazar</button>
                </div>
            </div>
            ))
         )}
    </div>
  );
}