"use client"

import { useRouter } from 'next/navigation';
import React, { use, useEffect, useState } from 'react';

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
    const [imageChanged, setImageChanged] = useState(false);

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
        setImageChanged(!!selected);
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

    return (
        <div className='py-20 max-w-2xl mx-auto px-4'>
            <h1 className='text-3xl text-center font-bold'>Editar Tratamiento</h1>

            <form onSubmit={handleSubmit} className='flex flex-col space-y-4 mt-6 border p-6 rounded shadow-sm bg-white text-gray-800'>
                <div className='flex flex-col items-center space-y-3'>
                    <img
                        src={`/images/tratamientos/${image || 'placeholder.png'}`}
                        alt={name || 'Tratamiento'}
                        onError={(e) => { e.currentTarget.src = '/images/tratamientos/placeholder.png' }}
                        className='w-32 h-32 object-cover rounded-lg border border-slate-300 shadow-sm'
                    />
                    <span className='text-xs text-gray-500'>
                        {imageChanged ? `Nueva imagen seleccionada: ${file.name}` : 'Imagen actual'}
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className='p-2 border border-slate-300 rounded w-full file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer'
                    />
                </div>

                <input className='p-2 border border-slate-300 rounded' type="text" placeholder="Nombre" value={name} required onChange={(e) => setName(e.target.value)}/>
                <textarea className='p-2 border border-slate-300 rounded' placeholder="Contenido" value={content} required
                    onChange={(e) => setContent(e.target.value)}
                />
                <input
                    className='p-2 border border-slate-300 rounded'
                    type="text"
                    placeholder="Costo"
                    value={cost}
                    required
                    onChange={(e) => setCost(e.target.value)}
                />
                <input
                    className='p-2 border border-slate-300 rounded'
                    type="text"
                    placeholder="Duración"
                    value={duration}
                    required
                    onChange={(e) => setDuration(e.target.value)}
                />
                <button className='w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors'>
                    Guardar cambios
                </button>
            </form>

            <div className='flex space-x-4 mt-5'>
                <button
                    className='bg-gray-500 hover:bg-gray-600 text-white p-2 rounded transition-colors'
                    onClick={() => router.push('/tratamientos')}
                >
                    Regresar
                </button>
                <button
                    className='bg-red-600 hover:bg-red-700 text-white p-2 rounded transition-colors'
                    onClick={() => handleDelete()}
                >
                    Eliminar
                </button>
            </div>
        </div>
    );
}