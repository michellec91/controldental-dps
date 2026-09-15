import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const PROTECTED = ['placeholder.png']

export async function POST(request) {
    try {
        const data = await request.formData()
        const file = data.get('file')

        if (!file) {
            return NextResponse.json({ error: 'No se envió archivo' }, { status: 400 })
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'El archivo no es una imagen' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const ext = path.extname(file.name)
        const baseName = path.basename(file.name, ext)
        const timestamp = Date.now()
        const safeName = `${baseName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${timestamp}${ext}`

        const uploadDir = path.join(process.cwd(), 'public', 'images', 'tratamientos')
        await mkdir(uploadDir, { recursive: true })

        const filePath = path.join(uploadDir, safeName)
        await writeFile(filePath, buffer)

        return NextResponse.json({ filename: safeName }, { status: 201 })
    } catch (error) {
        console.error('Error al subir imagen:', error)
        return NextResponse.json({ error: 'Error al subir la imagen' }, { status: 500 })
    }
}