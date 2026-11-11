"use client"

import Link from "next/link"
import Navbar from "../../components/Navbar"
import { alertSuccess, alertError, alertConfirm } from "../../lib/alert.js"
import { useEffect, useState } from "react"
import { FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export default function Tratamientos() {
  const [tratamientos, setTratamientos] = useState([])
  const [search, setSearch] = useState("")
  const [filteredTratamientos, setFilteredTratamientos] = useState([])

  const removeAccents = (str = "") => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  }

  // Obtener tratamientos desde la API
  const fetchRecords = async () => {
    try {
      const response = await fetch(`${API_URL}/tratamientos`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      setTratamientos(data)
    } catch (error) {
      console.error("Error al obtener tratamientos:", error)

      alertError(
        "Error de conexión",
        "No se pudieron cargar los tratamientos."
      )
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  useEffect(() => {
    setFilteredTratamientos(tratamientos)
  }, [tratamientos])

  // Eliminar tratamiento
  const handleDelete = async (id_tratamiento) => {
    const tratamiento = tratamientos.find(
      (t) => t.id_tratamiento === id_tratamiento
    )

    const confirmed = await alertConfirm({
      title: "¿Eliminar tratamiento?",
      text: `Se eliminará "${
        tratamiento?.nombre || "el tratamiento"
      }" de forma permanente`,
      confirmText: "Sí, eliminar",
      danger: true,
    })

    if (!confirmed) return

    try {
      const response = await fetch(
        `${API_URL}/tratamientos/${id_tratamiento}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      setTratamientos((prev) =>
        prev.filter(
          (tratamiento) =>
            tratamiento.id_tratamiento !== id_tratamiento
        )
      )

      alertSuccess(
        "Eliminado",
        "El tratamiento se eliminó correctamente"
      )
    } catch (error) {
      console.error("Error al eliminar tratamiento:", error)

      alertError(
        "Error",
        "No se pudo eliminar el tratamiento. Inténtalo de nuevo."
      )
    }
  }

  // Buscar tratamientos
  const handleSearch = (e) => {
    const value = e.target.value

    setSearch(value)

    const q = removeAccents(
      value.toLowerCase().trim()
    )

    if (q.length === 0) {
      setFilteredTratamientos(tratamientos)
      return
    }

    const filterValues = tratamientos.filter(
      (tratamiento) => {
        const nombre = removeAccents(
          (tratamiento.nombre || "").toLowerCase()
        )

        const descripcion = removeAccents(
          (tratamiento.descripcion || "").toLowerCase()
        )

        return (
          nombre.includes(q) ||
          descripcion.includes(q)
        )
      }
    )

    setFilteredTratamientos(filterValues)
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--background)] text-[var(--text)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* ENCABEZADO */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text)]">
                Administración de Tratamientos
              </h1>

              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Gestione los tratamientos disponibles en la clínica
              </p>
            </div>

            <Link
              href="/tratamientos/create"
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-4
                py-2
                bg-[var(--primary)]
                rounded-lg
                text-white
                font-medium
                hover:bg-[var(--primary-dark)]
                transition-colors
                shadow-sm
                w-full
                sm:w-auto
              "
            >
              <FaPlus size={14} />
              <span>Añadir Tratamiento</span>
            </Link>
          </div>

          {/* BUSCADOR */}
          <div className="mt-6">
            <div className="relative w-full sm:max-w-sm">
              <FaSearch
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-[var(--text-secondary)]
                "
                size={14}
              />

              <input
                type="text"
                placeholder="Buscar tratamiento..."
                className="
                  w-full
                  pl-9
                  pr-3
                  py-2.5

                  border
                  border-[var(--border)]
                  rounded-lg

                  text-sm
                  text-[var(--text)]

                  bg-[var(--input)]

                  placeholder:text-[var(--text-secondary)]

                  focus:outline-none
                  focus:ring-2
                  focus:ring-[var(--primary)]
                  focus:border-[var(--primary)]

                  transition-shadow
                "
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* CANTIDAD */}
          <p className="mt-4 text-sm text-[var(--text-secondary)]">
            {filteredTratamientos.length} tratamiento
            {filteredTratamientos.length !== 1 ? "s" : ""}
            {search && ` para "${search}"`}
          </p>

          {/* TABLA ESCRITORIO */}
          <div
            className="
              hidden
              md:block
              mt-4
              overflow-hidden

              rounded-xl

              border
              border-[var(--border)]

              shadow-sm

              bg-[var(--surface)]
            "
          >
            <table className="min-w-full border-collapse">

              <thead className="bg-[var(--surface-soft)]">
                <tr>
                  <th
                    className="
                      px-6
                      py-3
                      text-start
                      text-xs
                      font-semibold
                      text-[var(--text-secondary)]
                      uppercase
                      tracking-wider
                      border
                      border-[var(--border)]
                    "
                  >
                    Imagen
                  </th>

                  <th className="px-6 py-3 text-start text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border border-[var(--border)]">
                    Nombre
                  </th>

                  <th className="px-6 py-3 text-start text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border border-[var(--border)]">
                    Descripción
                  </th>

                  <th className="px-6 py-3 text-start text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border border-[var(--border)]">
                    Precio
                  </th>

                  <th className="px-6 py-3 text-start text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border border-[var(--border)]">
                    Duración
                  </th>

                  <th className="px-6 py-3 text-start text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border border-[var(--border)]">
                    Estado
                  </th>

                  <th className="px-6 py-3 text-end text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border border-[var(--border)]">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredTratamientos.map(
                  (tratamiento) => (
                    <tr
                      key={tratamiento.id_tratamiento}
                      className="
                        bg-[var(--surface)]
                        hover:bg-[var(--surface-soft)]
                        transition-colors
                      "
                    >

                      {/* IMAGEN */}
                      <td className="px-6 py-4 border border-[var(--border)]">
                        <img
                          src={
                            tratamiento.imagen ||
                            "/images/tratamientos/placeholder.png"
                          }
                          alt={tratamiento.nombre}
                          onError={(e) => {
                            e.currentTarget.src =
                              "/images/tratamientos/placeholder.png"
                          }}
                          className="
                            w-14
                            h-14
                            object-cover
                            rounded-lg
                            border
                            border-[var(--border)]
                            shadow-sm
                          "
                        />
                      </td>

                      {/* NOMBRE */}
                      <td className="px-6 py-4 text-sm font-medium text-[var(--text)] border border-[var(--border)]">
                        {tratamiento.nombre}
                      </td>

                      {/* DESCRIPCIÓN */}
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)] max-w-xs border border-[var(--border)]">
                        {tratamiento.descripcion}
                      </td>

                      {/* PRECIO */}
                      <td className="px-6 py-4 text-sm font-semibold text-[var(--text)] border border-[var(--border)]">
                        $
                        {Number(
                          tratamiento.precio
                        ).toFixed(2)}
                      </td>

                      {/* DURACIÓN */}
                      <td className="px-6 py-4 text-sm text-[var(--text-secondary)] border border-[var(--border)]">
                        {tratamiento.duracion} min
                      </td>

                      {/* ESTADO */}
                      <td className="px-6 py-4 text-sm border border-[var(--border)]">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            tratamiento.estado === "activo"
                              ? "bg-green-500/15 text-green-500"
                              : "bg-slate-500/15 text-[var(--text-secondary)]"
                          }`}
                        >
                          {tratamiento.estado}
                        </span>
                      </td>

                      {/* ACCIONES */}
                      <td className="px-6 py-4 text-end border border-[var(--border)]">
                        <div className="flex justify-end items-center gap-2">

                          <Link
                            href={`/tratamientos/${tratamiento.id_tratamiento}?mode=edit`}
                            title="Editar"
                            aria-label="Editar"
                            className="
                              p-2.5
                              rounded-full

                              bg-blue-500/15
                              text-blue-400

                              hover:bg-blue-500/25

                              transition-colors
                            "
                          >
                            <FaEdit size={14} />
                          </Link>

                          <button
                            type="button"
                            title="Eliminar"
                            aria-label="Eliminar"
                            onClick={() =>
                              handleDelete(
                                tratamiento.id_tratamiento
                              )
                            }
                            className="
                              p-2.5
                              rounded-full

                              bg-red-500/15
                              text-red-400

                              hover:bg-red-500/25

                              transition-colors
                            "
                          >
                            <FaTrash size={14} />
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                )}
              </tbody>

            </table>
          </div>

          {/* VISTA MÓVIL */}
          <div className="md:hidden mt-4 space-y-3">

            {filteredTratamientos.map(
              (tratamiento) => (
                <div
                  key={tratamiento.id_tratamiento}
                  className="
                    bg-[var(--surface)]

                    border
                    border-[var(--border)]

                    rounded-xl

                    shadow-sm

                    p-4

                    flex
                    gap-4
                  "
                >

                  <img
                    src={
                      tratamiento.imagen ||
                      "/images/tratamientos/placeholder.png"
                    }
                    alt={tratamiento.nombre}
                    onError={(e) => {
                      e.currentTarget.src =
                        "/images/tratamientos/placeholder.png"
                    }}
                    className="
                      w-20
                      h-20

                      object-cover

                      rounded-lg

                      border
                      border-[var(--border)]

                      shrink-0
                    "
                  />

                  <div className="flex-1 min-w-0">

                    <h3 className="text-base font-semibold text-[var(--text)] truncate">
                      {tratamiento.nombre}
                    </h3>

                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mt-0.5">
                      {tratamiento.descripcion}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-sm">

                      <span className="font-semibold text-[var(--text)]">
                        $
                        {Number(
                          tratamiento.precio
                        ).toFixed(2)}
                      </span>

                      <span className="text-[var(--text-secondary)]">
                        •
                      </span>

                      <span className="text-[var(--text-secondary)]">
                        {tratamiento.duracion} min
                      </span>

                    </div>

                    <div className="mt-2">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          tratamiento.estado === "activo"
                            ? "bg-green-500/15 text-green-500"
                            : "bg-slate-500/15 text-[var(--text-secondary)]"
                        }`}
                      >
                        {tratamiento.estado}
                      </span>
                    </div>

                    <div className="mt-3 flex gap-2">

                      <Link
                        href={`/tratamientos/${tratamiento.id_tratamiento}?mode=edit`}
                        className="
                          flex-1

                          inline-flex
                          items-center
                          justify-center
                          gap-2

                          px-3
                          py-2

                          rounded-lg

                          bg-blue-500/15
                          text-blue-400

                          text-sm
                          font-medium

                          hover:bg-blue-500/25

                          transition-colors
                        "
                      >
                        <FaEdit size={14} />
                        Editar
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            tratamiento.id_tratamiento
                          )
                        }
                        className="
                          flex-1

                          inline-flex
                          items-center
                          justify-center
                          gap-2

                          px-3
                          py-2

                          rounded-lg

                          bg-red-500/15
                          text-red-400

                          text-sm
                          font-medium

                          hover:bg-red-500/25

                          transition-colors
                        "
                      >
                        <FaTrash size={14} />
                        Eliminar
                      </button>

                    </div>

                  </div>
                </div>
              )
            )}

          </div>

          {/* SIN RESULTADOS */}
          {filteredTratamientos.length === 0 && (
            <div
              className="
                mt-8
                text-center
                py-12

                bg-[var(--surface)]

                rounded-xl

                border
                border-dashed
                border-[var(--border)]
              "
            >
              <p className="text-[var(--text-secondary)]">
                {search
                  ? `No se encontraron tratamientos para "${search}"`
                  : "No hay tratamientos registrados todavía"}
              </p>              
            </div>
          )}

        </div>
      </main>
    </>
  )
}