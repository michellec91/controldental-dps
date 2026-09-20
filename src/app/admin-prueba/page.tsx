"use client";

import SelectorFecha from "../../features/dashboard-perfil/components/selectorFecha";
import { useEffect, useMemo, useState } from "react";
import {
  FaCalendarDay,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,  
} from "react-icons/fa";

import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../features/autenticacion/components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import styles from "./page.module.css";

interface Cita {
  id: string;
  fecha?: string;
  hora?: string;
  estado?: string;

  paciente?: string;
  nombrePaciente?: string;

  tratamiento?: string;
  nombreTratamiento?: string;
}

const API_URL = "http://localhost:3001";

export default function AdminPruebaPage() {
  const { usuario } = useAuth();

  const [citas, setCitas] = useState<Cita[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarCitas() {
    try {
      const respuesta = await fetch(`${API_URL}/citas`, {
        cache: "no-store",
      });

      if (!respuesta.ok) {
        throw new Error("No fue posible obtener las citas.");
      }

      const datos: Cita[] = await respuesta.json();

      setCitas(datos);
      setError("");
    } catch (error) {
      console.error(error);
      setError(
        "No fue posible actualizar la información del dashboard."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCitas();

    // Actualización dinámica cada 10 segundos.
    const intervalo = setInterval(() => {
      cargarCitas();
    }, 10000);

    return () => clearInterval(intervalo);
  }, []);

  const [fechaSeleccionada, setFechaSeleccionada] = useState(obtenerFechaLocal());

  const citasHoy = useMemo(() => {
    return citas.filter((cita) => {
      return cita.fecha?.startsWith(fechaSeleccionada);
    });
  }, [citas, fechaSeleccionada]);

  const pendientes = citasHoy.filter(
    (cita) => normalizarEstado(cita.estado) === "pendiente"
  );

  const confirmadas = citasHoy.filter(
    (cita) => normalizarEstado(cita.estado) === "confirmada"
  );

  const canceladas = citasHoy.filter(
    (cita) => normalizarEstado(cita.estado) === "cancelada"
  );

  const proximasCitas = useMemo(() => {
    return citas
      .filter((cita) => {
        if (!cita.fecha) return false;

        return (
          cita.fecha >= fechaSeleccionada &&
          normalizarEstado(cita.estado) !== "cancelada"
        );
      })
      .sort((a, b) => {
        const primera = `${a.fecha ?? ""} ${a.hora ?? ""}`;
        const segunda = `${b.fecha ?? ""} ${b.hora ?? ""}`;

        return primera.localeCompare(segunda);
      })
      .slice(0, 5);
  }, [citas, fechaSeleccionada]);

  const actividadSemanal = useMemo(() => {
    return obtenerActividadSemanal(citas, fechaSeleccionada);
  }, [citas, fechaSeleccionada]);

  return (
    <ProtectedRoute>
      <div className={styles.page}>
        <Navbar />

        <main className={styles.container}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>
                Panel administrativo
              </p>

              <h1>
                Bienvenido, {usuario?.nombre ?? "Administrador"}
              </h1>

              <p className={styles.subtitle}>
                Resumen general de la actividad de la clínica.
              </p>
            </div>

            < SelectorFecha fecha={fechaSeleccionada} onChange={setFechaSeleccionada}
            />
          </header>

          {error && (
            <div className={styles.errorMessage}>
              {error}
            </div>
          )}

          <section className={styles.statsGrid}>
            <article className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.blue}`}>
                <FaCalendarDay />
              </div>

              <div>
                <span className={styles.statLabel}>
                  Citas de hoy
                </span>

                <strong className={styles.statNumber}>
                  {cargando ? "..." : citasHoy.length}
                </strong>

                <p>Programadas para hoy</p>
              </div>
            </article>

            <article className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.orange}`}>
                <FaClock />
              </div>

              <div>
                <span className={styles.statLabel}>
                  Pendientes
                </span>

                <strong className={styles.statNumber}>
                  {cargando ? "..." : pendientes.length}
                </strong>

                <p>Solicitudes por revisar</p>
              </div>
            </article>

            <article className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.green}`}>
                <FaCheckCircle />
              </div>

              <div>
                <span className={styles.statLabel}>
                  Confirmadas
                </span>

                <strong className={styles.statNumber}>
                  {cargando ? "..." : confirmadas.length}
                </strong>

                <p>Citas confirmadas hoy</p>
              </div>
            </article>

            <article className={styles.statCard}>
              <div className={`${styles.statIcon} ${styles.red}`}>
                <FaTimesCircle />
              </div>

              <div>
                <span className={styles.statLabel}>
                  Canceladas
                </span>

                <strong className={styles.statNumber}>
                  {cargando ? "..." : canceladas.length}
                </strong>

                <p>Canceladas durante el día</p>
              </div>
            </article>
          </section>

          <section className={styles.middleGrid}>
            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Actividad semanal</h2>
                  <p>Citas registradas durante la semana.</p>
                </div>
              </div>

              <div className={styles.chart}>
                {actividadSemanal.map((dia) => {
                  const maximo = Math.max(
                    ...actividadSemanal.map((item) => item.total),
                    1
                  );

                  const porcentaje =
                    (dia.total / maximo) * 100;

                  return (
                    <div
                      className={styles.chartColumn}
                      key={dia.nombre}
                    >
                      <span className={styles.chartValue}>
                        {dia.total}
                      </span>

                      <div className={styles.barContainer}>
                        <div
                          className={styles.bar}
                          style={{
                            height: `${Math.max(
                              porcentaje,
                              dia.total > 0 ? 12 : 2
                            )}%`,
                          }}
                        />
                      </div>

                      <span className={styles.day}>
                        {dia.nombre}
                      </span>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Solicitudes pendientes</h2>
                  <p>Citas que necesitan revisión.</p>
                </div>

                <span className={styles.pendingBadge}>
                  {pendientes.length} pendientes
                </span>
              </div>

              {pendientes.length === 0 ? (
                <div className={styles.emptyState}>
                  <FaCheckCircle />

                  <strong>No hay solicitudes pendientes</strong>

                  <p>
                    Las nuevas solicitudes aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className={styles.pendingList}>
                  {pendientes.slice(0, 4).map((cita) => (
                    <div
                      key={cita.id}
                      className={styles.pendingItem}
                    >
                      <div>
                        <strong>
                          {obtenerPaciente(cita)}
                        </strong>

                        <span>
                          {cita.hora || "Hora pendiente"}
                        </span>
                      </div>

                      <button type="button">
                        Revisar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>Próximas citas</h2>
                <p>
                  Próximos turnos programados en la clínica.
                </p>
              </div>
            </div>

            {proximasCitas.length === 0 ? (
              <div className={styles.emptyTable}>
                No hay citas próximas registradas.
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Paciente</th>
                      <th>Tratamiento</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {proximasCitas.map((cita) => (
                      <tr key={cita.id}>
                        <td>{formatearFecha(cita.fecha)}</td>

                        <td>{cita.hora || "—"}</td>

                        <td>{obtenerPaciente(cita)}</td>

                        <td>{obtenerTratamiento(cita)}</td>

                        <td>
                          <span
                            className={`${styles.status} ${
                              styles[
                                normalizarEstado(cita.estado)
                              ] ?? ""
                            }`}
                          >
                            {formatearEstado(cita.estado)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}

function obtenerFechaLocal() {
  const fecha = new Date();

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizarEstado(estado?: string) {
  return estado?.trim().toLowerCase() ?? "";
}

function formatearEstado(estado?: string) {
  if (!estado) return "Sin estado";

  return (
    estado.charAt(0).toUpperCase() +
    estado.slice(1).toLowerCase()
  );
}

function obtenerPaciente(cita: Cita) {
  return (
    cita.nombrePaciente ||
    cita.paciente ||
    "Paciente sin especificar"
  );
}

function obtenerTratamiento(cita: Cita) {
  return (
    cita.nombreTratamiento ||
    cita.tratamiento ||
    "Sin especificar"
  );
}

function formatearFecha(fecha?: string) {
  if (!fecha) return "—";

  const fechaLimpia = fecha.split("T")[0];

  const partes = fechaLimpia.split("-");

  if (partes.length !== 3) return fecha;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obtenerActividadSemanal(
  citas: Cita[],
  fechaSeleccionada: string
) {
  const nombres = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const [year, month, day] = fechaSeleccionada
    .split("-")
    .map(Number);

  const fechaBase = new Date(year, month - 1, day);

  const numeroDia = fechaBase.getDay();

  // Obtener el lunes de la semana seleccionada
  const diferenciaLunes =
    numeroDia === 0 ? -6 : 1 - numeroDia;

  const lunes = new Date(fechaBase);
  lunes.setDate(fechaBase.getDate() + diferenciaLunes);
  lunes.setHours(0, 0, 0, 0);

  return nombres.map((nombre, indice) => {
    const fecha = new Date(lunes);
    fecha.setDate(lunes.getDate() + indice);

    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");

    const fechaTexto = `${year}-${month}-${day}`;

    const total = citas.filter((cita) =>
      cita.fecha?.startsWith(fechaTexto)
    ).length;

    return {
      nombre,
      total,
    };
  });
}