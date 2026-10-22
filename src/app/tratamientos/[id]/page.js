"use client"

import { useRouter } from "next/navigation"
import { useUploadThing } from "../../../lib/uploadthing-client"
import Navbar from "../../../components/Navbar"
import {
  alertSuccess,
  alertError,
  alertConfirm,
} from "../../../lib/alert.js"

import React, {
  use,
  useEffect,
  useState,
} from "react"

import {
  FaSave,
  FaTrash,
  FaUpload,
  FaTimes,
} from "react-icons/fa"

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001"

export default function EditarTratamiento({ params }) {
  const resolveParams = use(params)
  const id = resolveParams.id

  const router = useRouter()

  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [precio, setPrecio] = useState("")
  const [duracion, setDuracion] = useState("")
  const [estado, setEstado] = useState("activo")

  const [imagen, setImagen] = useState("")
  const [imagenOriginal, setImagenOriginal] = useState("")

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState("")
  const [uploading, setUploading] = useState(false)

  const [errors, setErrors] = useState({})

  const { startUpload } =
    useUploadThing("imageUploader")

  // =============================================
  // CARGAR TRATAMIENTO DESDE MYSQL
  // =============================================

  useEffect(() => {
    if (!id) return

    const fetchTratamiento = async () => {
      try {
        const response = await fetch(
          `${API_URL}/tratamientos/${id}`
        )

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()

        setNombre(data.nombre || "")
        setDescripcion(data.descripcion || "")
        setPrecio(data.precio || "")
        setDuracion(
          data.duracion !== null &&
            data.duracion !== undefined
            ? String(data.duracion)
            : ""
        )
        setEstado(data.estado || "activo")

        setImagen(data.imagen || "")
        setImagenOriginal(data.imagen || "")
      } catch (error) {
        console.error(
          "Error al obtener tratamiento:",
          error
        )

        alertError(
          "Error",
          "No se pudo cargar el tratamiento."
        )
      }
    }

    fetchTratamiento()
  }, [id])

  // =============================================
  // VALIDACIONES
  // =============================================

  const validate = {
    nombre: (value) => {
      if (!value.trim()) {
        return "El nombre es obligatorio"
      }

      if (value.trim().length < 3) {
        return "El nombre debe tener al menos 3 caracteres"
      }

      if (value.trim().length > 150) {
        return "El nombre no puede superar 150 caracteres"
      }

      return ""
    },

    descripcion: (value) => {
      if (!value.trim()) {
        return "La descripción es obligatoria"
      }

      if (value.trim().length < 10) {
        return "La descripción debe tener al menos 10 caracteres"
      }

      if (value.trim().length > 500) {
        return "La descripción no puede superar 500 caracteres"
      }

      return ""
    },

    precio: (value) => {
      if (!value.toString().trim()) {
        return "El precio es obligatorio"
      }

      if (
        !/^\d+(\.\d{1,2})?$/.test(
          value.toString().trim()
        )
      ) {
        return "Usa solo números, por ejemplo 25 o 25.50"
      }

      if (parseFloat(value) <= 0) {
        return "El precio debe ser mayor a 0"
      }

      return ""
    },

    duracion: (value) => {
      if (!value.toString().trim()) {
        return "La duración es obligatoria"
      }

      if (!/^\d+$/.test(value.toString())) {
        return "La duración debe ser un número"
      }

      if (parseInt(value) <= 0) {
        return "La duración debe ser mayor a 0"
      }

      return ""
    },
  }

  const validateForm = () => {
    const newErrors = {
      nombre: validate.nombre(nombre),
      descripcion:
        validate.descripcion(descripcion),
      precio: validate.precio(precio),
      duracion: validate.duracion(duracion),
      file: errors.file || "",
    }

    setErrors(newErrors)

    return Object.values(newErrors).every(
      (error) => !error
    )
  }

  const handleBlur = (field) => {
    let error = ""

    if (field === "nombre") {
      error = validate.nombre(nombre)
    }

    if (field === "descripcion") {
      error =
        validate.descripcion(descripcion)
    }

    if (field === "precio") {
      error = validate.precio(precio)
    }

    if (field === "duracion") {
      error = validate.duracion(duracion)
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }))
  }

  const inputClass = (field) => {
    const base =
      "w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-shadow"

    if (errors[field]) {
      return `${base} border-red-500 focus:ring-red-500 focus:border-red-500`
    }

    return `${base} border-gray-300 focus:ring-blue-500 focus:border-blue-500`
  }

  // =============================================
  // IMAGEN
  // =============================================

  const handleFileChange = (e) => {
    const selected =
      e.target.files[0] || null

    if (!selected) {
      setFile(null)
      setPreview("")
      return
    }

    if (
      selected.size >
      4 * 1024 * 1024
    ) {
      setErrors((prev) => ({
        ...prev,
        file:
          "La imagen no puede superar 4 MB",
      }))

      e.target.value = ""
      setFile(null)
      setPreview("")
      return
    }

    if (
      !selected.type.startsWith("image/")
    ) {
      setErrors((prev) => ({
        ...prev,
        file:
          "Solo se permiten imágenes",
      }))

      e.target.value = ""
      setFile(null)
      setPreview("")
      return
    }

    setFile(selected)

    setErrors((prev) => ({
      ...prev,
      file: "",
    }))

    const objectUrl =
      URL.createObjectURL(selected)

    setPreview(objectUrl)
  }

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleRemoveSelected = () => {
    setFile(null)
    setPreview("")
  }

  // =============================================
  // ACTUALIZAR
  // =============================================

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (uploading) return

    if (!validateForm()) {
      alertError(
        "Datos incompletos",
        "Revisa los campos marcados en rojo."
      )

      return
    }

    let nuevaImagenUrl = imagen
    let imagenNuevaSubida = false

    try {
      // Si seleccionó una imagen nueva
      if (file) {
        setUploading(true)

        const uploaded =
          await startUpload([file])

        if (
          !uploaded ||
          !uploaded[0]
        ) {
          throw new Error(
            "Error al subir la imagen"
          )
        }

        nuevaImagenUrl =
          uploaded[0].url

        imagenNuevaSubida = true

        setUploading(false)
      }

      // Actualizar MySQL
      const response = await fetch(
        `${API_URL}/tratamientos/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            nombre,
            descripcion,
            precio: parseFloat(precio),
            duracion:
              parseInt(duracion),
            estado,
            imagen:
              nuevaImagenUrl || null,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        )
      }

      // Borrar imagen anterior de UploadThing
      // solamente si realmente se cambió
      if (
        imagenNuevaSubida &&
        imagenOriginal &&
        imagenOriginal.startsWith(
          "http"
        )
      ) {
        try {
          await fetch(
            "/api/delete-uploadthing",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                url: imagenOriginal,
              }),
            }
          )
        } catch (cleanupError) {
          console.error(
            "Error al borrar imagen vieja:",
            cleanupError
          )
        }
      }

      alertSuccess(
        "¡Actualizado!",
        "Los cambios se guardaron correctamente"
      )

      router.push("/tratamientos")
    } catch (error) {
      setUploading(false)

      console.error(
        "Error al actualizar tratamiento:",
        error
      )

      // Si subimos una imagen pero falló MySQL,
      // intentamos eliminarla de UploadThing
      if (
        imagenNuevaSubida &&
        nuevaImagenUrl &&
        nuevaImagenUrl.startsWith(
          "http"
        )
      ) {
        try {
          await fetch(
            "/api/delete-uploadthing",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                url: nuevaImagenUrl,
              }),
            }
          )
        } catch (cleanupError) {
          console.error(
            "Error al limpiar imagen huérfana:",
            cleanupError
          )
        }
      }

      alertError(
        "Error al actualizar",
        "No se pudieron guardar los cambios. Inténtalo de nuevo."
      )
    }
  }

  // =============================================
  // ELIMINAR
  // =============================================

  const handleDelete = async () => {
    const confirmed =
      await alertConfirm({
        title:
          "¿Eliminar tratamiento?",

        text: `Se eliminará "${nombre}" de forma permanente`,

        confirmText:
          "Sí, eliminar",

        danger: true,
      })

    if (!confirmed) return

    try {
      // Primero borrar de MySQL
      const response = await fetch(
        `${API_URL}/tratamientos/${id}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        )
      }

      // Después borrar imagen de UploadThing
      if (
        imagen &&
        imagen.startsWith("http")
      ) {
        try {
          await fetch(
            "/api/delete-uploadthing",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                url: imagen,
              }),
            }
          )
        } catch (cleanupError) {
          console.error(
            "No se pudo eliminar la imagen:",
            cleanupError
          )
        }
      }

      alertSuccess(
        "Eliminado",
        "El tratamiento se eliminó correctamente"
      )

      router.push("/tratamientos")
    } catch (error) {
      console.error(
        "Error al eliminar tratamiento:",
        error
      )

      alertError(
        "Error",
        "No se pudo eliminar el tratamiento."
      )
    }
  }

  const previewSrc =
    preview ||
    imagen ||
    "/images/tratamientos/placeholder.png"

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">

            <div className="mb-6">

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Editar Tratamiento
              </h1>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* NOMBRE */}

              <div>

                <label
                  htmlFor="nombre"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Nombre{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <input
                  id="nombre"
                  type="text"
                  placeholder="Ingresa el nombre del tratamiento..."
                  value={nombre}
                  onChange={(e) => {
                    setNombre(
                      e.target.value
                    )

                    if (
                      errors.nombre
                    ) {
                      setErrors(
                        (prev) => ({
                          ...prev,
                          nombre: "",
                        })
                      )
                    }
                  }}
                  onBlur={() =>
                    handleBlur(
                      "nombre"
                    )
                  }
                  required
                  className={inputClass(
                    "nombre"
                  )}
                />

                {errors.nombre && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.nombre}
                  </p>
                )}

              </div>

              {/* DESCRIPCIÓN */}

              <div>

                <label
                  htmlFor="descripcion"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Descripción{" "}
                  <span className="text-red-500">
                    *
                  </span>
                </label>

                <textarea
                  id="descripcion"
                  placeholder="Descripción del tratamiento..."
                  value={descripcion}
                  onChange={(e) => {
                    setDescripcion(
                      e.target.value
                    )

                    if (
                      errors.descripcion
                    ) {
                      setErrors(
                        (prev) => ({
                          ...prev,
                          descripcion:
                            "",
                        })
                      )
                    }
                  }}
                  onBlur={() =>
                    handleBlur(
                      "descripcion"
                    )
                  }
                  required
                  rows={3}
                  maxLength={500}
                  className={`${inputClass(
                    "descripcion"
                  )} resize-none`}
                />

                <div className="flex justify-between items-start mt-1 gap-2">

                  {errors.descripcion ? (
                    <p className="text-xs text-red-600">
                      {
                        errors.descripcion
                      }
                    </p>
                  ) : (
                    <span />
                  )}

                  <p className="text-xs text-gray-400 shrink-0">
                    {
                      descripcion.length
                    }
                    /500
                  </p>

                </div>

              </div>

              {/* PRECIO Y DURACIÓN */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>

                  <label
                    htmlFor="precio"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Precio{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      $
                    </span>

                    <input
                      id="precio"
                      type="text"
                      inputMode="decimal"
                      placeholder="Ingrese el precio..."
                      value={precio}
                      onChange={(e) => {
                        const value =
                          e.target
                            .value

                        if (
                          value ===
                            "" ||
                          /^\d*\.?\d{0,2}$/.test(
                            value
                          )
                        ) {
                          setPrecio(
                            value
                          )

                          if (
                            errors.precio
                          ) {
                            setErrors(
                              (
                                prev
                              ) => ({
                                ...prev,
                                precio:
                                  "",
                              })
                            )
                          }
                        }
                      }}
                      onBlur={() =>
                        handleBlur(
                          "precio"
                        )
                      }
                      required
                      className={`${inputClass(
                        "precio"
                      )} pl-7`}
                    />

                  </div>

                  {errors.precio && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.precio}
                    </p>
                  )}

                </div>

                <div>

                  <label
                    htmlFor="duracion"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Duración (minutos){" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="duracion"
                    type="number"
                    min="1"
                    placeholder="Ej. 30"
                    value={duracion}
                    onChange={(e) => {
                      setDuracion(
                        e.target.value
                      )

                      if (
                        errors.duracion
                      ) {
                        setErrors(
                          (prev) => ({
                            ...prev,
                            duracion:
                              "",
                          })
                        )
                      }
                    }}
                    onBlur={() =>
                      handleBlur(
                        "duracion"
                      )
                    }
                    required
                    className={inputClass(
                      "duracion"
                    )}
                  />

                  {errors.duracion && (
                    <p className="text-xs text-red-600 mt-1">
                      {
                        errors.duracion
                      }
                    </p>
                  )}

                </div>

              </div>

              {/* ESTADO */}

              <div>

                <label
                  htmlFor="estado"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Estado
                </label>

                <select
                  id="estado"
                  value={estado}
                  onChange={(e) =>
                    setEstado(
                      e.target.value
                    )
                  }
                  className={inputClass(
                    "estado"
                  )}
                >
                  <option value="activo">
                    Activo
                  </option>

                  <option value="inactivo">
                    Inactivo
                  </option>

                </select>

              </div>

              {/* IMAGEN */}

              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Imagen del tratamiento
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">

                  <img
                    src={previewSrc}
                    alt={
                      nombre ||
                      "Tratamiento"
                    }
                    onError={(e) => {
                      e.currentTarget.src =
                        "/images/tratamientos/placeholder.png"
                    }}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0"
                  />

                  <div className="flex-1 min-w-0 w-full">

                    <div className="flex items-center gap-3 flex-wrap">

                      <label
                        htmlFor="file"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <FaUpload
                          size={12}
                        />

                        <span>
                          {file
                            ? "Cambiar imagen"
                            : "Elegir imagen"}
                        </span>
                      </label>

                      {file && (
                        <button
                          type="button"
                          onClick={
                            handleRemoveSelected
                          }
                          className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition-colors"
                        >
                          <FaTimes
                            size={11}
                          />

                          Quitar
                        </button>
                      )}

                      <input
                        id="file"
                        type="file"
                        accept="image/*"
                        onChange={
                          handleFileChange
                        }
                        className="hidden"
                      />

                    </div>

                    <p className="text-xs text-gray-500 mt-2 truncate">

                      {file
                        ? `Nueva: ${file.name}`
                        : imagen
                        ? "Imagen actual guardada"
                        : "Sin imagen"}

                    </p>

                    {errors.file && (
                      <p className="text-xs text-red-600 mt-1">
                        {
                          errors.file
                        }
                      </p>
                    )}

                  </div>

                </div>

              </div>

              {/* BOTONES */}

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">

                <button
                  type="button"
                  onClick={
                    handleDelete
                  }
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-red-200 rounded-lg text-sm font-medium text-red-600 bg-white hover:bg-red-50 transition-colors w-full sm:w-auto"
                >
                  <FaTrash
                    size={12}
                  />

                  Eliminar
                </button>

                <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/tratamientos"
                      )
                    }
                    className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={uploading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <FaSave
                      size={14}
                    />

                    {uploading
                      ? "Subiendo imagen..."
                      : "Guardar cambios"}

                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

      </main>
    </>
  )
}