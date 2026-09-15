"use client"
import { useRouter } from "next/navigation"
import React, { useState } from 'react'

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
                body: JSON.stringify({ name, content, cost, duration, image: imageName}),
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)

            router.push('/tratamientos')
        } catch (error) {
            console.error('Error al crear tratamiento:', error)
        }
    }

  return (
    <div className='flex flex-col items-center py-20'>
        <h1 className='text-3xl'>Crear Tratamiento</h1>
        <form onSubmit={handleSubmit} className='flex flex-col space-y-4 mt-6 border p-6 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer'>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0] || null)} className='p-2 border border-slate-500' />
            <input type="text" placeholder='Nombre' value={name} className='p-2 border border-slate-500' onChange={(e) => setName(e.target.value)} required />
            <textarea placeholder='Descripción' value={content} className='p-2 border border-slate-500' onChange={(e) => setContent(e.target.value)} required />
            <input type="text" placeholder='Costo' value={cost} className='p-2 border border-slate-500' onChange={(e) => setCost(e.target.value)} required />
            <input type="text" placeholder='Duracion' value={duration} className='p-2 border border-slate-500' onChange={(e) => setDuration(e.target.value)} required />
            <button className='bg-blue-500 text-white p-2 rounded'>Registrar el tratamiento</button>
        </form>
        <div className='flex space-x-4 mt-5'>
                <button className='bg-gray-500 hover:bg-gray-600 text-white p-2 rounded transition-colors' onClick={() => router.push('/tratamientos')}>
                    Regresar
                </button>
            </div>
    </div>
    )
}

export default Create