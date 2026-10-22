"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  FaCalendarDay,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import SelectorFecha from "../../features/dashboard-perfil/components/selectorFecha";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../features/autenticacion/components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";

import {
  Cita,
  obtenerCitas,
} from "../../services/citasService";

import styles from "./page.module.css";

export default function DashboardPage() {
  const { usuario } = useAuth();
  const router = useRouter();

  const [citas, setCitas] =
    useState<Cita[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    fechaSeleccionada,
    setFechaSeleccionada,
  ] = useState(
    obtenerFechaLocal()
  );

  // -----------------------------------------
  // CARGAR CITAS
  // -----------------------------------------
  async function cargarCitas() {
    try {
      const datos =
        await obtenerCitas();

      setCitas(datos);
      setError("");
    } catch (error) {
      console.error(
        "Error al cargar dashboard:",
        error
      );

      setError(
        "No fue posible actualizar la información del dashboard."
      );
    } finally {
      setCargando(false);
    }
  }

  // -----------------------------------------
  // CARGA INICIAL Y ACTUALIZACIÓN AUTOMÁTICA
  // -----------------------------------------
  useEffect(() => {
    cargarCitas();

    const intervalo =
      setInterval(() => {
        cargarCitas();
      }, 10000);

    return () =>
      clearInterval(
        intervalo
      );
  }, []);

  // -----------------------------------------
  // CITAS DEL DÍA SELECCIONADO
  // -----------------------------------------
  const citasHoy =
    useMemo(() => {
      return citas.filter(
        (cita) => {
          const fechaCita =
            normalizarFecha(
              cita.fecha
            );

          return (
            fechaCita ===
            fechaSeleccionada
          );
        }
      );
    }, [
      citas,
      fechaSeleccionada,
    ]);

  // -----------------------------------------
  // ESTADÍSTICAS
  // -----------------------------------------
  const pendientes =
    citasHoy.filter(
      (cita) =>
        normalizarEstado(
          cita.estado
        ) === "pendiente"
    );

  const confirmadas =
    citasHoy.filter(
      (cita) =>
        normalizarEstado(
          cita.estado
        ) === "confirmada"
    );

  const canceladas =
    citasHoy.filter(
      (cita) =>
        normalizarEstado(
          cita.estado
        ) === "cancelada"
    );

  // Se deja calculado por si después
  // quieres agregar una tarjeta.
  const completadas =
    citasHoy.filter(
      (cita) =>
        normalizarEstado(
          cita.estado
        ) === "completada"
    );

  // -----------------------------------------
  // PRÓXIMAS CITAS
  // -----------------------------------------
  const proximasCitas =
    useMemo(() => {
      return citas
        .filter(
          (cita) => {
            const fechaCita =
              normalizarFecha(
                cita.fecha
              );

            if (
              !fechaCita
            ) {
              return false;
            }

            return (
              fechaCita >=
                fechaSeleccionada &&
              normalizarEstado(
                cita.estado
              ) !==
                "cancelada"
            );
          }
        )
        .sort(
          (a, b) => {
            const fechaA =
              normalizarFecha(
                a.fecha
              );

            const fechaB =
              normalizarFecha(
                b.fecha
              );

            const primera =
              `${fechaA} ${
                a.hora ?? ""
              }`;

            const segunda =
              `${fechaB} ${
                b.hora ?? ""
              }`;

            return primera.localeCompare(
              segunda
            );
          }
        )
        .slice(
          0,
          5
        );
    }, [
      citas,
      fechaSeleccionada,
    ]);

  // -----------------------------------------
  // ACTIVIDAD SEMANAL
  // -----------------------------------------
  const actividadSemanal =
    useMemo(() => {
      return obtenerActividadSemanal(
        citas,
        fechaSeleccionada
      );
    }, [
      citas,
      fechaSeleccionada,
    ]);

  return (
    <ProtectedRoute>
      <div
        className={
          styles.page
        }
      >
        <Navbar />

        <main
          className={
            styles.container
          }
        >
          {/* CABECERA */}
          <header
            className={
              styles.header
            }
          >
            <div>
              <p
                className={
                  styles.eyebrow
                }
              >
                Panel
                administrativo
              </p>

              <h1>
                Bienvenido,{" "}
                {usuario?.nombre ??
                  "Administrador"}
              </h1>

              <p
                className={
                  styles.subtitle
                }
              >
                Resumen general de
                la actividad de la
                clínica.
              </p>
            </div>

            <SelectorFecha
              fecha={
                fechaSeleccionada
              }
              onChange={
                setFechaSeleccionada
              }
            />
          </header>

          {/* ERROR */}
          {error && (
            <div
              className={
                styles.errorMessage
              }
            >
              {error}
            </div>
          )}

          {/* ESTADÍSTICAS */}
          <section
            className={
              styles.statsGrid
            }
          >
            {/* CITAS DEL DÍA */}
            <article
              className={
                styles.statCard
              }
            >
              <div
                className={`${styles.statIcon} ${styles.blue}`}
              >
                <FaCalendarDay />
              </div>

              <div>
                <span
                  className={
                    styles.statLabel
                  }
                >
                  Citas de hoy
                </span>

                <strong
                  className={
                    styles.statNumber
                  }
                >
                  {cargando
                    ? "..."
                    : citasHoy.length}
                </strong>

                <p>
                  Programadas para
                  hoy
                </p>
              </div>
            </article>

            {/* PENDIENTES */}
            <article
              className={
                styles.statCard
              }
            >
              <div
                className={`${styles.statIcon} ${styles.orange}`}
              >
                <FaClock />
              </div>

              <div>
                <span
                  className={
                    styles.statLabel
                  }
                >
                  Pendientes
                </span>

                <strong
                  className={
                    styles.statNumber
                  }
                >
                  {cargando
                    ? "..."
                    : pendientes.length}
                </strong>

                <p>
                  Solicitudes por
                  revisar
                </p>
              </div>
            </article>

            {/* CONFIRMADAS */}
            <article
              className={
                styles.statCard
              }
            >
              <div
                className={`${styles.statIcon} ${styles.green}`}
              >
                <FaCheckCircle />
              </div>

              <div>
                <span
                  className={
                    styles.statLabel
                  }
                >
                  Confirmadas
                </span>

                <strong
                  className={
                    styles.statNumber
                  }
                >
                  {cargando
                    ? "..."
                    : confirmadas.length}
                </strong>

                <p>
                  Citas confirmadas
                  hoy
                </p>
              </div>
            </article>

            {/* CANCELADAS */}
            <article
              className={
                styles.statCard
              }
            >
              <div
                className={`${styles.statIcon} ${styles.red}`}
              >
                <FaTimesCircle />
              </div>

              <div>
                <span
                  className={
                    styles.statLabel
                  }
                >
                  Canceladas
                </span>

                <strong
                  className={
                    styles.statNumber
                  }
                >
                  {cargando
                    ? "..."
                    : canceladas.length}
                </strong>

                <p>
                  Canceladas durante
                  el día
                </p>
              </div>
            </article>
          </section>

          {/* ACTIVIDAD + SOLICITUDES */}
          <section
            className={
              styles.middleGrid
            }
          >
            {/* ACTIVIDAD SEMANAL */}
            <article
              className={
                styles.panel
              }
            >
              <div
                className={
                  styles.panelHeader
                }
              >
                <div>
                  <h2>
                    Actividad semanal
                  </h2>

                  <p>
                    Citas registradas
                    durante la
                    semana.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.chart
                }
              >
                {actividadSemanal.map(
                  (dia) => {
                    const maximo =
                      Math.max(
                        ...actividadSemanal.map(
                          (
                            item
                          ) =>
                            item.total
                        ),
                        1
                      );

                    const porcentaje =
                      (dia.total /
                        maximo) *
                      100;

                    return (
                      <div
                        className={
                          styles.chartColumn
                        }
                        key={
                          dia.nombre
                        }
                      >
                        <span
                          className={
                            styles.chartValue
                          }
                        >
                          {
                            dia.total
                          }
                        </span>

                        <div
                          className={
                            styles.barContainer
                          }
                        >
                          <div
                            className={
                              styles.bar
                            }
                            style={{
                              height: `${Math.max(
                                porcentaje,
                                dia.total >
                                  0
                                  ? 12
                                  : 2
                              )}%`,
                            }}
                          />
                        </div>

                        <span
                          className={
                            styles.day
                          }
                        >
                          {
                            dia.nombre
                          }
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </article>

            {/* SOLICITUDES PENDIENTES */}
            <article
              className={
                styles.panel
              }
            >
              <div
                className={
                  styles.panelHeader
                }
              >
                <div>
                  <h2>
                    Solicitudes
                    pendientes
                  </h2>

                  <p>
                    Citas que
                    necesitan
                    revisión.
                  </p>
                </div>

                <span
                  className={
                    styles.pendingBadge
                  }
                >
                  {
                    pendientes.length
                  }{" "}
                  pendientes
                </span>
              </div>

              {pendientes.length ===
              0 ? (
                <div
                  className={
                    styles.emptyState
                  }
                >
                  <FaCheckCircle />

                  <strong>
                    No hay
                    solicitudes
                    pendientes
                  </strong>

                  <p>
                    Las nuevas
                    solicitudes
                    aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div
                  className={
                    styles.pendingList
                  }
                >
                  {pendientes
                    .slice(
                      0,
                      4
                    )
                    .map(
                      (cita) => (
                        <div
                          key={
                            cita.id_cita
                          }
                          className={
                            styles.pendingItem
                          }
                        >
                          <div>
                            <strong>
                              {obtenerPaciente(
                                cita
                              )}
                            </strong>

                            <span>
                              {formatearHora(
                                cita.hora
                              )}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                "/solicitudes"
                              )
                            }
                          >
                            Revisar
                          </button>
                        </div>
                      )
                    )}
                </div>
              )}
            </article>
          </section>

          {/* PRÓXIMAS CITAS */}
          <section
            className={
              styles.panel
            }
          >
            <div
              className={
                styles.panelHeader
              }
            >
              <div>
                <h2>
                  Próximas citas
                </h2>

                <p>
                  Próximos turnos
                  programados en la
                  clínica.
                </p>
              </div>
            </div>

            {proximasCitas.length ===
            0 ? (
              <div
                className={
                  styles.emptyTable
                }
              >
                No hay citas
                próximas
                registradas.
              </div>
            ) : (
              <div
                className={
                  styles.tableWrapper
                }
              >
                <table
                  className={
                    styles.table
                  }
                >
                  <thead>
                    <tr>
                      <th>
                        Fecha
                      </th>

                      <th>
                        Hora
                      </th>

                      <th>
                        Paciente
                      </th>

                      <th>
                        Tratamiento
                      </th>

                      <th>
                        Estado
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {proximasCitas.map(
                      (cita) => (
                        <tr
                          key={
                            cita.id_cita
                          }
                        >
                          <td>
                            {formatearFecha(
                              cita.fecha
                            )}
                          </td>

                          <td>
                            {formatearHora(
                              cita.hora
                            )}
                          </td>

                          <td>
                            {obtenerPaciente(
                              cita
                            )}
                          </td>

                          <td>
                            {obtenerTratamiento(
                              cita
                            )}
                          </td>

                          <td>
                            <span
                              className={`${styles.status} ${
                                styles[
                                  normalizarEstado(
                                    cita.estado
                                  )
                                ] ??
                                ""
                              }`}
                            >
                              {formatearEstado(
                                cita.estado
                              )}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
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

// -----------------------------------------
// FECHA LOCAL YYYY-MM-DD
// -----------------------------------------
function obtenerFechaLocal() {
  const fecha =
    new Date();

  const year =
    fecha.getFullYear();

  const month =
    String(
      fecha.getMonth() + 1
    ).padStart(
      2,
      "0"
    );

  const day =
    String(
      fecha.getDate()
    ).padStart(
      2,
      "0"
    );

  return `${year}-${month}-${day}`;
}

// -----------------------------------------
// NORMALIZAR FECHA MYSQL
// -----------------------------------------
function normalizarFecha(
  fecha?: string
) {
  if (!fecha) {
    return "";
  }

  return fecha.includes("T")
    ? fecha.split("T")[0]
    : fecha;
}

// -----------------------------------------
// NORMALIZAR ESTADO
// -----------------------------------------
function normalizarEstado(
  estado?: string
) {
  return (
    estado
      ?.trim()
      .toLowerCase() ??
    ""
  );
}

// -----------------------------------------
// MOSTRAR ESTADO
// -----------------------------------------
function formatearEstado(
  estado?: string
) {
  if (!estado) {
    return "Sin estado";
  }

  return (
    estado
      .charAt(0)
      .toUpperCase() +
    estado
      .slice(1)
      .toLowerCase()
  );
}

// -----------------------------------------
// NOMBRE DEL PACIENTE
// -----------------------------------------
function obtenerPaciente(
  cita: Cita
) {
  const nombre =
    [
      cita.paciente_nombre,
      cita.paciente_apellido,
    ]
      .filter(Boolean)
      .join(" ");

  return (
    nombre ||
    "Paciente sin especificar"
  );
}

// -----------------------------------------
// TRATAMIENTO
// -----------------------------------------
function obtenerTratamiento(
  cita: Cita
) {
  return (
    cita.tratamiento_nombre ||
    "Sin especificar"
  );
}

// -----------------------------------------
// FORMATEAR FECHA
// -----------------------------------------
function formatearFecha(
  fecha?: string
) {
  if (!fecha) {
    return "—";
  }

  const fechaLimpia =
    normalizarFecha(fecha);

  const partes =
    fechaLimpia.split("-");

  if (
    partes.length !== 3
  ) {
    return fecha;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// -----------------------------------------
// FORMATEAR HORA
// -----------------------------------------
function formatearHora(
  hora?: string
) {
  if (!hora) {
    return "—";
  }

  const horaLimpia =
    hora.slice(0, 5);

  const [
    horas,
    minutos,
  ] =
    horaLimpia.split(":");

  const numeroHora =
    Number(horas);

  if (
    numeroHora === 12
  ) {
    return `12:${minutos} M`;
  }

  if (
    numeroHora > 12
  ) {
    return `${
      numeroHora - 12
    }:${minutos} PM`;
  }

  return `${numeroHora}:${minutos} AM`;
}

// -----------------------------------------
// ACTIVIDAD SEMANAL
// -----------------------------------------
function obtenerActividadSemanal(
  citas: Cita[],
  fechaSeleccionada: string
) {
  const nombres = [
    "Lun",
    "Mar",
    "Mié",
    "Jue",
    "Vie",
    "Sáb",
  ];

  const [
    year,
    month,
    day,
  ] =
    fechaSeleccionada
      .split("-")
      .map(Number);

  const fechaBase =
    new Date(
      year,
      month - 1,
      day
    );

  const numeroDia =
    fechaBase.getDay();

  const diferenciaLunes =
    numeroDia === 0
      ? -6
      : 1 -
        numeroDia;

  const lunes =
    new Date(
      fechaBase
    );

  lunes.setDate(
    fechaBase.getDate() +
      diferenciaLunes
  );

  lunes.setHours(
    0,
    0,
    0,
    0
  );

  return nombres.map(
    (
      nombre,
      indice
    ) => {
      const fecha =
        new Date(
          lunes
        );

      fecha.setDate(
        lunes.getDate() +
          indice
      );

      const year =
        fecha.getFullYear();

      const month =
        String(
          fecha.getMonth() +
            1
        ).padStart(
          2,
          "0"
        );

      const day =
        String(
          fecha.getDate()
        ).padStart(
          2,
          "0"
        );

      const fechaTexto =
        `${year}-${month}-${day}`;

      const total =
        citas.filter(
          (cita) =>
            normalizarFecha(
              cita.fecha
            ) ===
              fechaTexto
        ).length;

      return {
        nombre,
        total,
      };
    }
  );
}