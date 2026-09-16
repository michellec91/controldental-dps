"use client"
import { useRouter } from "next/navigation"
import { useUploadThing } from "../../../lib/uploadthing-client"
import Navbar from "../../../components/Navbar"
import Link from "next/link"
import React, { useState } from 'react'
import { FaArrowLeft, FaSave, FaUpload, FaTimes } from "react-icons/fa"

const Create = () => {
    const [name, setName] = useState('')
    const [content, setContent] = useState('')
    const [cost, setCost] = useState('')
    const [duration, setDuration] = useState('')
    const [file, setFile] = useState(null)
    const [uploading, setUploading] = useState(false)

    const [errors, setErrors] = useState({})

    const router = useRouter()

    const { startUpload } = useUploadThing("imageUploader")

    const validate = {
        name: (value) => {
            if (!value.trim()) return 'El nombre es obligatorio'
            if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres'
            if (value.trim().length > 100) return 'El nombre no puede superar 100 caracteres'
            return ''
        },
        content: (value) => {
            if (!value.trim()) return 'La descripción es obligatoria'
            if (value.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres'
            if (value.trim().length > 500) return 'La descripción no puede superar 500 caracteres'
            return ''
        },
        cost: (value) => {
            if (!value.toString().trim()) return 'El costo es obligatorio'
            if (!/^\d+(\.\d{1,2})?$/.test(value.toString().trim())) {
                return 'Usa solo números (ej: 25 o 25.50)'
            }
            if (parseFloat(value) <= 0) return 'El costo debe ser mayor a 0'
            return ''
        },
        duration: (value) => {
            if (!value.trim()) return 'La duración es obligatoria'
            if (value.trim().length < 3) return 'La duración debe tener al menos 3 caracteres'
            if (value.trim().length > 50) return 'La duración no puede superar 50 caracteres'
            return ''
        },
    }

    const validateForm = () => {
        const newErrors = {
            name: validate.name(name),
            content: validate.content(content),
            cost: validate.cost(cost),
            duration: validate.duration(duration),
        }
        setErrors(newErrors)
        return Object.values(newErrors).every((e) => !e)
    }

    const handleBlur = (field) => {
        let error = ''
        if (field === 'name') error = validate.name(name)
        if (field === 'content') error = validate.content(content)
        if (field === 'cost') error = validate.cost(cost)
        if (field === 'duration') error = validate.duration(duration)
        setErrors((prev) => ({ ...prev, [field]: error }))
    }

    const inputClass = (field) => {
        const base = "w-full px-3.5 py-2.5 border rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-shadow"
        if (errors[field]) {
            return `${base} border-red-500 focus:ring-red-500 focus:border-red-500`
        }
        return `${base} border-gray-300 focus:ring-blue-500 focus:border-blue-500`
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (uploading) return

        if (!validateForm()) {
            return
        }

        let imageUrl = ''

        try {
            imageUrl = '/images/tratamientos/placeholder.png'

            // 1) Si hay archivo → súbelo
            if (file) {
                setUploading(true)
                const uploaded = await startUpload([file])

                if (!uploaded || !uploaded[0]) {
                    throw new Error('Error al subir la imagen')
                }

                imageUrl = uploaded[0].url
                setUploading(false)
            }

            const response = await fetch('http://localhost:3001/tratamientos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    content,
                    cost,
                    duration,
                    image: imageUrl,
                }),
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)

            router.push('/tratamientos')

        } catch (error) {
            setUploading(false)
            console.error('Error al crear tratamiento:', error)

            if (imageUrl && imageUrl.startsWith('http')) {
                try {
                    await fetch('/api/delete-uploadthing', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: imageUrl }),
                    })
                } catch (cleanupError) {
                    console.error('Error al limpiar imagen huérfana:', cleanupError)
                }
            }

            alert('Hubo un error al crear el tratamiento. Inténtalo de nuevo.')
        }
    }

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
                                Completa la información del nuevo tratamiento
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Ingresa el nombre del tratamiento..."
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value)
                                        if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
                                    }}
                                    onBlur={() => handleBlur('name')}
                                    required
                                    className={inputClass('name')}
                                />
                                {errors.name && (
                                    <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Descripción <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="content"
                                    placeholder="Descripcion del tratamiento..."
                                    value={content}
                                    onChange={(e) => {
                                        setContent(e.target.value)
                                        if (errors.content) setErrors((prev) => ({ ...prev, content: '' }))
                                    }}
                                    onBlur={() => handleBlur('content')}
                                    required
                                    rows={3}
                                    className={`${inputClass('content')} resize-none`}
                                />
                                <div className="flex justify-between items-start mt-1 gap-2">
                                    {errors.content ? (
                                        <p className="text-xs text-red-600">{errors.content}</p>
                                    ) : (
                                        <span />
                                    )}
                                    <p className="text-xs text-gray-400 shrink-0">
                                        {content.length}/500
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Costo <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                            $
                                        </span>
                                        <input
                                            id="cost"
                                            type="text"
                                            inputMode="decimal"
                                            placeholder="Ingrese el costo del tratamiento..."
                                            value={cost}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                                    setCost(value)
                                                    if (errors.cost) setErrors((prev) => ({ ...prev, cost: '' }))
                                                }
                                            }}
                                            onBlur={() => handleBlur('cost')}
                                            required
                                            className={`${inputClass('cost')} pl-7`}
                                        />
                                    </div>
                                    {errors.cost && (
                                        <p className="text-xs text-red-600 mt-1">{errors.cost}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Duración <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="duration"
                                        type="text"
                                        placeholder="Ingrese la duración del tratamiento..."
                                        value={duration}
                                        onChange={(e) => {
                                            setDuration(e.target.value)
                                            if (errors.duration) setErrors((prev) => ({ ...prev, duration: '' }))
                                        }}
                                        onBlur={() => handleBlur('duration')}
                                        required
                                        className={inputClass('duration')}
                                    />
                                    {errors.duration && (
                                        <p className="text-xs text-red-600 mt-1">{errors.duration}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Imagen del tratamiento
                                </label>

                                <div className="flex items-center gap-3">
                                    <label
                                        htmlFor="file"
                                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                                    >
                                        <FaUpload size={12} />
                                        <span>{file ? 'Cambiar archivo' : 'Elegir archivo'}</span>
                                    </label>

                                    {file ? (
                                        <>
                                            <span className="text-sm text-gray-500 truncate max-w-[200px]">
                                                {file.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setFile(null)}
                                                className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700"
                                            >
                                                <FaTimes size={11} />
                                                Quitar
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-sm text-gray-500">
                                            Ningún archivo seleccionado
                                        </span>
                                    )}

                                    <input
                                        id="file"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFile(e.target.files[0] || null)}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
                                >
                                    <FaSave size={14} />
                                    {uploading ? 'Subiendo imagen...' : 'Registrar tratamiento'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.push('/tratamientos')}
                                    className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </main>
        </>
    )
}

export default Create