import { NextResponse } from 'next/server'
import { UTApi } from "uploadthing/server"

const utapi = new UTApi()

export async function POST(request) {
    try {
        const { url } = await request.json()
        if (!url) return NextResponse.json({ error: 'Falta url' }, { status: 400 })

        if (!url.startsWith('http')) {
            return NextResponse.json({ message: 'No es URL de UploadThing' })
        }

        // UploadThing borra por "key", que es el último segmento de la URL
        const key = url.split('/').pop()
        await utapi.deleteFiles(key)

        return NextResponse.json({ message: 'Imagen eliminada' })
    } catch (error) {
        console.error('Error al borrar de UploadThing:', error)
        return NextResponse.json({ error: 'Error al borrar' }, { status: 500 })
    }
}