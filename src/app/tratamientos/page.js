"use client"
import Link from "next/link"
import Navbar from "../../components/Navbar"
import { alertSuccess, alertError, alertConfirm } from "../../lib/alert.js"
import { useEffect, useState } from "react"
import { FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa"

export default function Tratamientos() {
    const [tratamientos, setTratamientos] = useState([])
    const [search, setSearch] = useState('')
    const [filteredTratamientos, setFilteredTratamientos] = useState([])

    const removeAccents = (str) => {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    }

    const fetchRecords = async () => {
        try {
            const response = await fetch('http://localhost:3001/tratamientos')
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const data = await response.json()
            setTratamientos(data)
        } catch (error) {
            console.error('Error al obtener tratamientos:', error)
            alertError('Error de conexión', 'No se pudieron cargar los tratamientos.')
        }
    }

    useEffect(() => {
        fetchRecords()
    }, [])

    useEffect(() => {
        setFilteredTratamientos(tratamientos)
    }, [tratamientos])

    const handleDelete = async (id) => {
        const tratamiento = tratamientos.find(t => t.id === id)

        const confirmed = await alertConfirm({
            title: '¿Eliminar tratamiento?',
            text: `Se eliminará "${tratamiento?.name || 'el tratamiento'}" de forma permanente`,
            confirmText: 'Sí, eliminar',
            danger: true,
        })

        if (!confirmed) return

        try {
            if (tratamiento?.image?.startsWith('http')) {
                try {
                    await fetch('/api/delete-uploadthing', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: tratamiento.image }),
                    })
                } catch (cleanupError) {
                    console.error('No se pudo borrar la imagen de UploadThing:', cleanupError)
                }
            }

            const response = await fetch(`http://localhost:3001/tratamientos/${id}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)

            setTratamientos(prev => prev.filter(t => t.id !== id))

            alertSuccess('Eliminado', 'El tratamiento se eliminó correctamente')
        } catch (error) {
            console.error('Error al eliminar tratamiento:', error)
            alertError('Error', 'No se pudo eliminar el tratamiento. Inténtalo de nuevo.')
        }
    }

    const handleSearch = (e) => {
        const value = e.target.value
        setSearch(value)

        const q = removeAccents(value.toLowerCase().trim())

        if (q.length === 0) {
            setFilteredTratamientos(tratamientos)
            return
        }

        const filterValues = tratamientos.filter((row) => {
            const rawName = removeAccents(row.name.toLowerCase())
            const rawContent = removeAccents((row.content || '').toLowerCase())
            return rawName.includes(q) || rawContent.includes(q)
        })

        setFilteredTratamientos(filterValues)
    }

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Administración de Tratamientos
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Gestione los tratamientos disponibles en la clínica
                            </p>
                        </div>

                        <Link
                            href="/tratamientos/create"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto"
                        >
                            <FaPlus size={14} />
                            <span>Añadir Tratamiento</span>
                        </Link>
                    </div>

                    <div className="mt-6">
                        <div className="relative w-full sm:max-w-sm">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Buscar tratamiento..."
                                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                                value={search}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-gray-500">
                        {filteredTratamientos.length} tratamiento{filteredTratamientos.length !== 1 ? 's' : ''}
                        {search && ` para "${search}"`}
                    </p>

                    <div className="hidden md:block mt-4 overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
                        <table className="min-w-full border-collapse">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200">
                                        Imagen
                                    </th>
                                    <th className="px-6 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200">
                                        Nombre
                                    </th>
                                    <th className="px-6 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200">
                                        Descripción
                                    </th>
                                    <th className="px-6 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200">
                                        Precio
                                    </th>
                                    <th className="px-6 py-3 text-start text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200">
                                        Duración
                                    </th>
                                    <th className="px-6 py-3 text-end text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTratamientos.map((tratamiento) => (
                                    <tr key={tratamiento.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 border border-gray-200">
                                            <img
                                                src={
                                                    tratamiento.image?.startsWith('http')
                                                        ? tratamiento.image
                                                        : `/images/tratamientos/${tratamiento.image || 'placeholder.png'}`
                                                }
                                                alt={tratamiento.name}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/tratamientos/placeholder.png'
                                                }}
                                                className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-sm"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800 border border-gray-200">
                                            {tratamiento.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs border border-gray-200">
                                            {tratamiento.content}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-700 border border-gray-200">
                                            ${tratamiento.cost}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 border border-gray-200">
                                            {tratamiento.duration}
                                        </td>
                                        <td className="px-6 py-4 text-end border border-gray-200">
                                            <div className="flex justify-end items-center gap-2">
                                                <Link
                                                    href={`/tratamientos/${tratamiento.id}?mode=edit`}
                                                    title="Editar"
                                                    aria-label="Editar"
                                                    className="p-2 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-sm"
                                                >
                                                    <FaEdit size={14} />
                                                </Link>
                                                <button
                                                    type="button"
                                                    title="Eliminar"
                                                    aria-label="Eliminar"
                                                    onClick={() => handleDelete(tratamiento.id)}
                                                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden mt-4 space-y-3">
                        {filteredTratamientos.map((tratamiento) => (
                            <div
                                key={tratamiento.id}
                                className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex gap-4"
                            >
                                <img
                                    src={
                                        tratamiento.image?.startsWith('http')
                                            ? tratamiento.image
                                            : `/images/tratamientos/${tratamiento.image || 'placeholder.png'}`
                                    }
                                    alt={tratamiento.name}
                                    onError={(e) => {
                                        e.currentTarget.src = '/images/tratamientos/placeholder.png'
                                    }}
                                    className="w-20 h-20 object-cover rounded-lg border border-gray-200 shrink-0"
                                />

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-gray-900 truncate">
                                        {tratamiento.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                                        {tratamiento.content}
                                    </p>
                                    <div className="mt-2 flex items-center gap-3 text-sm">
                                        <span className="font-semibold text-gray-700">
                                            ${tratamiento.cost}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-500">
                                            {tratamiento.duration}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <Link
                                            href={`/tratamientos/${tratamiento.id}?mode=edit`}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition-colors"
                                        >
                                            <FaEdit size={14} />
                                            Editar
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(tratamiento.id)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                                        >
                                            <FaTrash size={14} />
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mensaje sin resultados */}
                    {filteredTratamientos.length === 0 && (
                        <div className="mt-8 text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">
                                {search
                                    ? `No se encontraron tratamientos para "${search}"`
                                    : 'No hay tratamientos registrados todavía'}
                            </p>
                        </div>
                    )}

                </div>
            </main>
        </>
    )
}