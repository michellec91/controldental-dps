import { NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import path from 'path'

const PROTECTED = ['placeholder.png']

export async function POST(request) {
    try {
        const { filename } = await request.json()

        if (!filename) {
            return NextResponse.json({ error: 'Falta el nombre del archivo' }, { status: 400 })
        }

        if (PROTECTED.includes(filename)) {
            return NextResponse.json({ message: 'Archivo protegido, no se borra' }, { status: 200 })
        }

        const safeName = path.basename(filename)

        const filePath = path.join(
            process.cwd(),
            'public',
            'images',
            'tratamientos',
            safeName
        )

        try {
            await unlink(filePath)
            return NextResponse.json({ message: 'Imagen eliminada' }, { status: 200 })
        } catch (err) {
            if (err.code === 'ENOENT') {
                return NextResponse.json({ message: 'La imagen no existía' }, { status: 200 })
            }
            throw err
        }
    } catch (error) {
        console.error('Error al eliminar imagen:', error)
        return NextResponse.json({ error: 'Error al eliminar la imagen' }, { status: 500 })
    }
}