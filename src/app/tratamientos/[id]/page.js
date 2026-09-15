"use client"

import { useRouter } from 'next/navigation';
import Navbar from "../../../components/Navbar"
import React, { use, useEffect, useState } from 'react';
import { FaArrowLeft, FaSave, FaTrash, FaUpload, FaTimes } from "react-icons/fa"

export default function EditarTratamiento({ params }) {
    const resolveParams = use(params);
    const id = resolveParams.id;
    const router = useRouter();

    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [cost, setCost] = useState('');
    const [duration, setDuration] = useState('');
    const [image, setImage] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchTratamiento = async () => {
            try {
                const response = await fetch(`http://localhost:3001/tratamientos/${id}`);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                setName(data.name || '');
                setContent(data.content || '');
                setCost(data.cost || '');
                setDuration(data.duration || '');
                setImage(data.image || '');
            } catch (error) {
                console.error('Error al obtener tratamiento:', error);
            }
        };

        fetchTratamiento();
    }, [id]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0] || null;
        setFile(selected);

        if (selected) {
            const objectUrl = URL.createObjectURL(selected);
            setPreview(objectUrl);
        } else {
            setPreview('');
        }
    }

    // Limpiar el objectURL cuando ya no se use
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleRemoveSelected = () => {
        setFile(null);
        setPreview('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let newImageName = image;

            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                if (!uploadRes.ok) throw new Error('Error al subir nueva imagen');
                const uploadData = await uploadRes.json();
                newImageName = uploadData.filename;

                if (image && !image.includes('placeholder')) {
                    await fetch('/api/delete-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ filename: image }),
                    });
                }
            }

            const response = await fetch(`http://localhost:3001/tratamientos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    content,
                    cost,
                    duration,
                    image: newImageName || 'placeholder.png',
                }),
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            router.push('/tratamientos');
        } catch (error) {
            console.error('Error al actualizar tratamiento:', error);
        }
    };

    const handleDelete = async () => {
        try {
            if (image && !image.includes('placeholder')) {
                await fetch('/api/delete-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filename: image }),
                });
            }

            const response = await fetch(`http://localhost:3001/tratamientos/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            router.push('/tratamientos');
        } catch (error) {
            console.error('Error al eliminar tratamiento:', error);
        }
    };

    // Imagen que se ve en el preview: la nueva (blob) o la actual
    const previewSrc = preview || `/images/tratamientos/${image || 'placeholder.png'}`;

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

                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    <img src={previewSrc} alt={name || 'Tratamiento'} onError={(e) => { e.currentTarget.src = '/images/tratamientos/placeholder.png'}} className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0"/>

                                    <div className="flex-1 min-w-0 w-full">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <label htmlFor="file" className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                                                <FaUpload size={12} />
                                                <span>{file ? 'Cambiar imagen' : 'Elegir imagen'}</span>
                                            </label>

                                            {file && (
                                                <button type="button" onClick={handleRemoveSelected} className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition-colors">
                                                    <FaTimes size={11} />
                                                    Quitar
                                                </button>
                                            )}

                                            <input id="file" type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>
                                        </div>

                                        <p className="text-xs text-gray-500 mt-2 truncate">
                                            {file
                                                ? `Nueva: ${file.name}`
                                                : image
                                                    ? `Actual: ${image}`
                                                    : 'Sin imagen'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => handleDelete()}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-red-200 rounded-lg text-sm font-medium text-red-600 bg-white hover:bg-red-50 transition-colors w-full sm:w-auto"
                                >
                                    <FaTrash size={12} />
                                    Eliminar
                                </button>

                                <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto">
                                    <button type="submit"
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        <FaSave size={14} />
                                        Guardar cambios
                                    </button>
                                    <button type="button" onClick={() => router.push('/tratamientos')} className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                                        Cancelar
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}