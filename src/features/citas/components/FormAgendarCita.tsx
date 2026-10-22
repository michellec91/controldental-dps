"use client";

import {
  useEffect,
  useState,
} from "react";

const API_URL =
  process.env
    .NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  rol: string;
  estado: string;
}

interface Tratamiento {
  id_tratamiento: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  estado: string;
  imagen?: string | null;
}

interface FormAgendarCitaProps {
  onCitaCreada?: () => void;
}

export function FormAgendarCita({
  onCitaCreada,
}: FormAgendarCitaProps) {
  const [
    usuarios,
    setUsuarios,
  ] =
    useState<Usuario[]>([]);

  const [
    tratamientos,
    setTratamientos,
  ] =
    useState<
      Tratamiento[]
    >([]);

  const [
    idUsuario,
    setIdUsuario,
  ] =
    useState("");

  const [
    idTratamiento,
    setIdTratamiento,
  ] =
    useState("");

  const [
    fecha,
    setFecha,
  ] =
    useState("");

  const [
    hora,
    setHora,
  ] =
    useState(
      "08:00"
    );

  const [
    errorGeneral,
    setErrorGeneral,
  ] =
    useState("");

  const [
    cargando,
    setCargando,
  ] =
    useState(true);

  const [
    guardando,
    setGuardando,
  ] =
    useState(false);

  // -----------------------------------------
  // FECHA MÍNIMA
  // -----------------------------------------
  const hoy =
    new Date();

  const hoyStr =
    `${hoy.getFullYear()}-${String(
      hoy.getMonth() + 1
    ).padStart(
      2,
      "0"
    )}-${String(
      hoy.getDate()
    ).padStart(
      2,
      "0"
    )}`;

  // -----------------------------------------
  // CARGAR PACIENTES Y TRATAMIENTOS
  // -----------------------------------------
  useEffect(() => {
    async function cargarDatos() {
      try {
        setCargando(
          true
        );

        const [
          respuestaUsuarios,
          respuestaTratamientos,
        ] =
          await Promise.all(
            [
              fetch(
                `${API_URL}/usuarios`
              ),

              fetch(
                `${API_URL}/tratamientos`
              ),
            ]
          );

        if (
          !respuestaUsuarios.ok ||
          !respuestaTratamientos.ok
        ) {
          throw new Error(
            "No fue posible cargar los datos."
          );
        }

        const usuariosData =
          await respuestaUsuarios.json();

        const tratamientosData =
          await respuestaTratamientos.json();

        // Solo pacientes activos
        const pacientesActivos =
          usuariosData.filter(
            (
              usuario: Usuario
            ) =>
              usuario.rol
                ?.toLowerCase() ===
                "paciente" &&
              usuario.estado
                ?.toLowerCase() ===
                "activo"
          );

        // Solo tratamientos activos
        const tratamientosActivos =
          tratamientosData.filter(
            (
              tratamiento: Tratamiento
            ) =>
              tratamiento.estado
                ?.toLowerCase() ===
              "activo"
          );

        setUsuarios(
          pacientesActivos
        );

        setTratamientos(
          tratamientosActivos
        );

        if (
          pacientesActivos.length >
          0
        ) {
          setIdUsuario(
            String(
              pacientesActivos[0]
                .id_usuario
            )
          );
        }

        if (
          tratamientosActivos.length >
          0
        ) {
          setIdTratamiento(
            String(
              tratamientosActivos[0]
                .id_tratamiento
            )
          );
        }
      } catch (error) {
        console.error(
          "Error al cargar datos:",
          error
        );

        setErrorGeneral(
          "No fue posible cargar pacientes o tratamientos."
        );
      } finally {
        setCargando(
          false
        );
      }
    }

    cargarDatos();
  }, []);

  // -----------------------------------------
  // HORAS DISPONIBLES
  // -----------------------------------------
  const horasDisponibles =
    [
      "08:00",
      "09:00",
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];

  // -----------------------------------------
  // FORMATEAR HORA VISUALMENTE
  // -----------------------------------------
  const formatearHora = (
    hora: string
  ) => {
    const [
      horas,
      minutos,
    ] =
      hora.split(
        ":"
      );

    const numeroHora =
      Number(
        horas
      );

    if (
      numeroHora ===
      12
    ) {
      return `12:${minutos} M`;
    }

    if (
      numeroHora >
      12
    ) {
      return `${
        numeroHora -
        12
      }:${minutos} PM`;
    }

    return `${numeroHora}:${minutos} AM`;
  };

  // -----------------------------------------
  // AGENDAR CITA
  // -----------------------------------------
  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setErrorGeneral(
        ""
      );

      if (
        !idUsuario ||
        !idTratamiento
      ) {
        setErrorGeneral(
          "Selecciona un paciente y un tratamiento."
        );

        return;
      }

      if (!fecha) {
        setErrorGeneral(
          "Selecciona una fecha."
        );

        return;
      }

      if (
        fecha <
        hoyStr
      ) {
        setErrorGeneral(
          "No se pueden agendar citas en fechas pasadas."
        );

        return;
      }

      const [
        year,
        month,
        day,
      ] =
        fecha
          .split(
            "-"
          )
          .map(
            Number
          );

      const fechaObj =
        new Date(
          year,
          month - 1,
          day
        );

      const diaSemana =
        fechaObj.getDay();

      // -----------------------------------------
      // DOMINGO
      // -----------------------------------------
      if (
        diaSemana ===
        0
      ) {
        setErrorGeneral(
          "La clínica no atiende los días domingo."
        );

        return;
      }

      // -----------------------------------------
      // SÁBADO POR LA TARDE
      // -----------------------------------------
      if (
        diaSemana ===
          6 &&
        [
          "13:00",
          "14:00",
          "15:00",
          "16:00",
          "17:00",
        ].includes(
          hora
        )
      ) {
        setErrorGeneral(
          "Los sábados la clínica solo atiende de 8:00 AM a 12:00 M."
        );

        return;
      }

      try {
        setGuardando(
          true
        );

        const respuesta =
          await fetch(
            `${API_URL}/citas`,
            {
              method:
                "POST",

              headers:
                {
                  "Content-Type":
                    "application/json",
                },

              body:
                JSON.stringify(
                  {
                    id_usuario:
                      Number(
                        idUsuario
                      ),

                    id_tratamiento:
                      Number(
                        idTratamiento
                      ),

                    fecha,

                    hora:
                      `${hora}:00`,

                    // Al crearla desde
                    // la web administrativa
                    // se registra confirmada.
                    estado:
                      "Confirmada",
                  }
                ),
            }
          );

        const data =
          await respuesta.json();

        if (
          !respuesta.ok
        ) {
          throw new Error(
            data.error ||
              data.mensaje ||
              "No fue posible registrar la cita."
          );
        }

        // -----------------------------------------
        // LIMPIAR FORMULARIO
        // -----------------------------------------
        setFecha("");
        setHora(
          "08:00"
        );

        if (
          onCitaCreada
        ) {
          await onCitaCreada();
        }
      } catch (error) {
        console.error(
          "Error al crear cita:",
          error
        );

        setErrorGeneral(
          error instanceof
            Error
            ? error.message
            : "Error al conectar con el servidor."
        );
      } finally {
        setGuardando(
          false
        );
      }
    };

  // -----------------------------------------
  // CARGANDO
  // -----------------------------------------
  if (cargando) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        Cargando datos...
      </div>
    );
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-4"
    >
      {/* PACIENTE */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">
          Paciente
        </label>

        <select
          value={
            idUsuario
          }
          onChange={(
            e
          ) => {
            setIdUsuario(
              e.target
                .value
            );

            setErrorGeneral(
              ""
            );
          }}
          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
          required
        >
          {usuarios.length ===
          0 ? (
            <option value="">
              No hay
              pacientes
              registrados
            </option>
          ) : (
            usuarios.map(
              (
                usuario
              ) => (
                <option
                  key={
                    usuario.id_usuario
                  }
                  value={
                    usuario.id_usuario
                  }
                >
                  {
                    usuario.nombre
                  }{" "}
                  {
                    usuario.apellido
                  }
                </option>
              )
            )
          )}
        </select>
      </div>

      {/* TRATAMIENTO */}
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">
          Tratamiento
        </label>

        <select
          value={
            idTratamiento
          }
          onChange={(
            e
          ) => {
            setIdTratamiento(
              e.target
                .value
            );

            setErrorGeneral(
              ""
            );
          }}
          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
          required
        >
          {tratamientos.length ===
          0 ? (
            <option value="">
              No hay
              tratamientos
              disponibles
            </option>
          ) : (
            tratamientos.map(
              (
                tratamiento
              ) => (
                <option
                  key={
                    tratamiento.id_tratamiento
                  }
                  value={
                    tratamiento.id_tratamiento
                  }
                >
                  {
                    tratamiento.nombre
                  }
                </option>
              )
            )
          )}
        </select>
      </div>

      {/* FECHA Y HORA */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Fecha
          </label>

          <input
            type="date"
            min={hoyStr}
            value={
              fecha
            }
            onChange={(
              e
            ) => {
              setFecha(
                e.target
                  .value
              );

              setErrorGeneral(
                ""
              );
            }}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Hora
          </label>

          <select
            value={hora}
            onChange={(
              e
            ) => {
              setHora(
                e.target
                  .value
              );

              setErrorGeneral(
                ""
              );
            }}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none bg-white"
            required
          >
            {horasDisponibles.map(
              (
                horaDisponible
              ) => (
                <option
                  key={
                    horaDisponible
                  }
                  value={
                    horaDisponible
                  }
                >
                  {formatearHora(
                    horaDisponible
                  )}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* ERROR */}
      {errorGeneral && (
        <div className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-600 border border-red-200">
          ⚠️{" "}
          {
            errorGeneral
          }
        </div>
      )}

      {/* BOTÓN */}
      <button
        type="submit"
        disabled={
          guardando ||
          usuarios.length ===
            0 ||
          tratamientos.length ===
            0
        }
        className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {guardando
          ? "Registrando..."
          : "Confirmar y Agendar Cita"}
      </button>
    </form>
  );
}