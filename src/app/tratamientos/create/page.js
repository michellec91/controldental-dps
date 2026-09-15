"use client"
import { useRouter } from "next/navigation"
import Navbar from "../../../components/Navbar"
import Link from "next/link"
import React, { useState } from 'react'
import { FaArrowLeft, FaSave, FaUpload, FaImage } from "react-icons/fa"

const Create = () => {
    const [name, setName] = useState('')
    const [content, setContent] = useState('')
    const [cost, setCost] = useState('')
    const [duration, setDuration] = useState('')
    const [file, setFile] = useState(null)

    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            let imageName = 'placeholder.png'

            if (file) {
                const formData = new FormData()
                formData.append('file', file)

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                })

                if (!uploadRes.ok) throw new Error('Error al subir imagen')
                const uploadData = await uploadRes.json()
                imageName = uploadData.filename
            }

            const response = await fetch('http://localhost:3001/tratamientos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, content, cost, duration, image: imageName }),
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)

            router.push('/tratamientos')
        } catch (error) {
            console.error('Error al crear tratamiento:', error)
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
                                    placeholder="Ej: Limpieza dental básica"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                />
                            </div>

                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Descripción <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="content"
                                    placeholder="Describe brevemente el tratamiento..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                    rows={3}
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
                                />
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
                                            placeholder="25.00"
                                            value={cost}
                                            onChange={(e) => setCost(e.target.value)}
                                            required
                                            className="w-full pl-7 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Duración <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="duration"
                                        type="text"
                                        placeholder="Ej: 30 min - 45 min"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        required
                                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                    />
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
                                        <span>Elegir archivo</span>
                                    </label>
                                    <span className="text-sm text-gray-500 truncate">
                                        {file ? file.name : 'Ningún archivo seleccionado'}
                                    </span>
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
                                <button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                    <FaSave size={14} />
                                    Registrar tratamiento
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