"use client"
import Link from "next/link"
import Navbar from "../../components/Navbar"
import { useEffect, useState } from "react"
import { FaEdit, FaTrash, FaSearch } from "react-icons/fa"

export default function Tratamientos() {
    const [tratamientos, setTratamientos] = useState([])
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
        }
    }

    useEffect(() => {
        fetchRecords()
    }, [])

    const handleDelete = async (id) => {
        try {
            const tratamiento = tratamientos.find(t => t.id === id)

            if (tratamiento?.image && !tratamiento.image.includes('placeholder')) {
                await fetch('/api/delete-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: tratamiento.image }),
                })
            }

            const response = await fetch(`http://localhost:3001/tratamientos/${id}`, {
                method: 'DELETE',
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)

            setTratamientos(prev => prev.filter(t => t.id !== id))
        } catch (error) {
            console.error('Error al eliminar tratamiento:', error)
        }
    }

    useEffect(() => {
        setFilteredTratamientos(tratamientos)
    }, [tratamientos])

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

    const [search, setSearch] = useState('')
    const [filteredTratamientos, setFilteredTratamientos] = useState([])



    return (
        <>
            <Navbar />
            <div className="px-48 py-20">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">Administración de Tratamientos</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Gestione los tratamientos disponibles en la clínica
                        </p>
                    </div>

                    <Link
                        href="/tratamientos/create"
                        className="px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600 transition-colors"
                    >
                        Añadir Tratamiento
                    </Link>
                </div>
                <div className="mt-6">
                    <div className="relative w-72">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar tratamiento"
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                </div>
                <div className="mt-6 overflow-hidden rounded-lg border border-gray-300 shadow-sm">
                    <table className="min-w-full border-collapse">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-start font-medium text-gray-500 uppercase border border-gray-300">
                                    Imagen
                                </th>
                                <th scope="col" className="px-6 py-3 text-start font-medium text-gray-500 uppercase border border-gray-300">
                                    Nombre
                                </th>
                                <th scope="col" className="px-6 py-3 text-start font-medium text-gray-500 uppercase border border-gray-300">
                                    Descripción
                                </th>
                                <th scope="col" className="px-6 py-3 text-start font-medium text-gray-500 uppercase border border-gray-300">
                                    Precio
                                </th>
                                <th scope="col" className="px-6 py-3 text-start font-medium text-gray-500 uppercase border border-gray-300">
                                    Duración
                                </th>
                                <th scope="col" className="px-6 py-3 text-end font-medium text-gray-500 uppercase border border-gray-300">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filteredTratamientos?.map((tratamiento) => (
                                    <tr key={tratamiento.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-500 border border-gray-300">
                                            <img
                                                src={`/images/tratamientos/${tratamiento.image || 'placeholder.png'}`}
                                                alt={tratamiento.name}
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/tratamientos/placeholder.png'
                                                }}
                                                className="w-14 h-14 object-cover rounded-lg border border-gray-200 shadow-sm"
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 border border-gray-300">
                                            {tratamiento.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 border border-gray-300">
                                            {tratamiento.content}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 border border-gray-300">
                                            ${tratamiento.cost}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 border border-gray-300">
                                            {tratamiento.duration}
                                        </td>
                                        <td className="px-6 py-4 text-end border border-gray-300">
                                            <div className="flex justify-end items-center space-x-2">
                                                <Link
                                                    href={`/tratamientos/${tratamiento.id}?mode=edit`}
                                                    title="Editar"
                                                    aria-label="Editar"
                                                    className="p-2 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-sm"
                                                >
                                                    <FaEdit size={16} />
                                                </Link>
                                                <button
                                                    type="button"
                                                    title="Eliminar"
                                                    aria-label="Eliminar"
                                                    onClick={() => handleDelete(tratamiento.id)}
                                                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-sm"
                                                >
                                                    <FaTrash size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

        </>
    );
}