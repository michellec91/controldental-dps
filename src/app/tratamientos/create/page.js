"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSave, FaUpload, FaTimes } from "react-icons/fa";

import Navbar from "../../../components/Navbar";
import { useUploadThing } from "../../../lib/uploadthing-client";
import {
  alertSuccess,
  alertError,
} from "../../../lib/alert.js";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

const Create = () => {
  const router = useRouter();

  // Datos del tratamiento según MySQL
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracion, setDuracion] = useState("");

  // Imagen
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Errores del formulario
  const [errors, setErrors] = useState({});

  const { startUpload } =
    useUploadThing("imageUploader");

  // -----------------------------------------
  // VALIDACIONES
  // -----------------------------------------
  const validate = {
    nombre: (value) => {
      if (!value.trim()) {
        return "El nombre es obligatorio";
      }

      if (value.trim().length < 3) {
        return "El nombre debe tener al menos 3 caracteres";
      }

      if (value.trim().length > 150) {
        return "El nombre no puede superar 150 caracteres";
      }

      return "";
    },

    descripcion: (value) => {
      if (!value.trim()) {
        return "La descripción es obligatoria";
      }

      if (value.trim().length < 10) {
        return "La descripción debe tener al menos 10 caracteres";
      }

      if (value.trim().length > 500) {
        return "La descripción no puede superar 500 caracteres";
      }

      return "";
    },

    precio: (value) => {
      const valor = value.toString().trim();

      if (!valor) {
        return "El precio es obligatorio";
      }

      if (!/^\d+(\.\d{1,2})?$/.test(valor)) {
        return "Usa un precio válido, por ejemplo 25 o 25.50";
      }

      if (parseFloat(valor) <= 0) {
        return "El precio debe ser mayor a 0";
      }

      return "";
    },

    duracion: (value) => {
      const valor = value.toString().trim();

      if (!valor) {
        return "La duración es obligatoria";
      }

      const minutos = Number(valor);

      if (
        !Number.isInteger(minutos) ||
        minutos <= 0
      ) {
        return "La duración debe ser un número entero mayor a 0";
      }

      return "";
    },
  };

  const validateForm = () => {
    const newErrors = {
      nombre: validate.nombre(nombre),
      descripcion:
        validate.descripcion(descripcion),
      precio: validate.precio(precio),
      duracion:
        validate.duracion(duracion),
    };

    setErrors(newErrors);

    return Object.values(newErrors).every(
      (error) => !error
    );
  };

  const handleBlur = (field) => {
    let error = "";

    if (field === "nombre") {
      error = validate.nombre(nombre);
    }

    if (field === "descripcion") {
      error =
        validate.descripcion(descripcion);
    }

    if (field === "precio") {
      error = validate.precio(precio);
    }

    if (field === "duracion") {
      error =
        validate.duracion(duracion);
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  const inputClass = (field) => {
    const base =
      "w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-shadow";

    if (errors[field]) {
      return `${base} border-red-500 focus:ring-red-500 focus:border-red-500`;
    }

    return `${base} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
  };

  // -----------------------------------------
  // SELECCIONAR IMAGEN
  // -----------------------------------------
  const handleFileChange = (event) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (
      !selectedFile.type.startsWith(
        "image/"
      )
    ) {
      alertError(
        "Archivo no válido",
        "Selecciona un archivo de imagen."
      );

      event.target.value = "";
      return;
    }

    if (
      selectedFile.size >
      4 * 1024 * 1024
    ) {
      alertError(
        "Imagen demasiado grande",
        "La imagen no puede superar los 4 MB."
      );

      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  // -----------------------------------------
  // CREAR TRATAMIENTO
  // -----------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (uploading) {
      return;
    }

    if (!validateForm()) {
      alertError(
        "Datos incompletos",
        "Revisa los campos marcados en rojo."
      );

      return;
    }

    let imageUrl = null;

    try {
      setUploading(true);

      // -------------------------------------
      // 1. Subir imagen a UploadThing
      // -------------------------------------
      if (file) {
        const uploaded =
          await startUpload([file]);

        if (
          !uploaded ||
          uploaded.length === 0
        ) {
          throw new Error(
            "No fue posible subir la imagen."
          );
        }

        imageUrl =
          uploaded[0].ufsUrl ||
          uploaded[0].url;

        if (!imageUrl) {
          throw new Error(
            "UploadThing no devolvió una URL válida."
          );
        }
      }

      // -------------------------------------
      // 2. Guardar tratamiento en MySQL
      // -------------------------------------
      const response = await fetch(
        `${API_URL}/tratamientos`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            nombre: nombre.trim(),
            descripcion:
              descripcion.trim(),
            precio:
              parseFloat(precio),
            duracion:
              parseInt(
                duracion,
                10
              ),
            estado: "activo",
            imagen: imageUrl,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.mensaje ||
            "No fue posible registrar el tratamiento."
        );
      }

      alertSuccess(
        "¡Creado!",
        "El tratamiento se registró correctamente."
      );

      router.push(
        "/tratamientos"
      );
    } catch (error) {
      console.error(
        "Error al crear tratamiento:",
        error
      );

      // Si UploadThing sí subió la imagen,
      // pero la BD falló, intentamos eliminar
      // la imagen que quedó sin utilizar.
      if (
        imageUrl &&
        imageUrl.startsWith("http")
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
                url: imageUrl,
              }),
            }
          );
        } catch (cleanupError) {
          console.error(
            "Error al limpiar imagen huérfana:",
            cleanupError
          );
        }
      }

      alertError(
        "Error al crear",
        error instanceof Error
          ? error.message
          : "Hubo un problema al registrar el tratamiento."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Crear Tratamiento
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Completa la información del
                nuevo tratamiento
              </p>
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
                    );

                    if (
                      errors.nombre
                    ) {
                      setErrors(
                        (prev) => ({
                          ...prev,
                          nombre: "",
                        })
                      );
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
                    );

                    if (
                      errors.descripcion
                    ) {
                      setErrors(
                        (prev) => ({
                          ...prev,
                          descripcion:
                            "",
                        })
                      );
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* PRECIO */}
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
                      placeholder="25.00"
                      value={precio}
                      onChange={(e) => {
                        const value =
                          e.target.value;

                        if (
                          value ===
                            "" ||
                          /^\d*\.?\d{0,2}$/.test(
                            value
                          )
                        ) {
                          setPrecio(
                            value
                          );

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
                            );
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
                      {
                        errors.precio
                      }
                    </p>
                  )}
                </div>

                {/* DURACIÓN */}
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
                    step="1"
                    placeholder="Ej. 45"
                    value={duracion}
                    onChange={(e) => {
                      setDuracion(
                        e.target.value
                      );

                      if (
                        errors.duracion
                      ) {
                        setErrors(
                          (prev) => ({
                            ...prev,
                            duracion:
                              "",
                          })
                        );
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

              {/* IMAGEN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Imagen del tratamiento
                </label>

                <div className="flex items-center gap-3">
                  <label
                    htmlFor="file"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <FaUpload
                      size={12}
                    />

                    <span>
                      {file
                        ? "Cambiar archivo"
                        : "Elegir archivo"}
                    </span>
                  </label>

                  {file ? (
                    <>
                      <span className="text-sm text-gray-500 truncate max-w-[200px]">
                        {file.name}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setFile(
                            null
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
                      >
                        <FaTimes
                          size={
                            11
                          }
                        />
                        Quitar
                      </button>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Ningún archivo
                      seleccionado
                    </span>
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

                <p className="text-xs text-gray-400 mt-2">
                  Imagen opcional.
                  Tamaño máximo: 4 MB.
                </p>
              </div>

              {/* BOTONES */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/tratamientos"
                    )
                  }
                  disabled={
                    uploading
                  }
                  className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={
                    uploading
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <FaSave
                    size={14}
                  />

                  {uploading
                    ? "Registrando..."
                    : "Registrar tratamiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default Create;