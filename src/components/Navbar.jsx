"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { FaHome, FaTooth, FaCalendarAlt, FaClipboardList, FaUserCircle, FaSignOutAlt, FaLock, FaUser } from "react-icons/fa"

export default function Navbar() {
    const [open, setOpen] = useState(false)
    const menuRef = useRef(null)
    const pathname = usePathname()

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        setOpen(false)
    }, [pathname])

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") setOpen(false)
        }
        document.addEventListener("keydown", handleEsc)
        return () => document.removeEventListener("keydown", handleEsc)
    }, [])

    const linkClass = (href) => {
        const active = pathname === href
        return `p-2.5 rounded-lg transition-colors ${
            active
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
        }`
    }

    return (
        <nav className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    <Link href="/" className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 text-blue-600">
                            <FaTooth size={18} />
                        </span>
                        <span className="text-base sm:text-lg font-semibold text-gray-800 hidden xs:inline">
                            Control Dental
                        </span>
                    </Link>

                    <div className="flex items-center gap-1 sm:gap-2">
                        <Link href="/" title="Inicio" aria-label="Inicio" className={linkClass('/')}>
                            <FaHome size={18} />
                        </Link>
                        <Link href="/tratamientos" title="Tratamientos" aria-label="Tratamientos" className={linkClass('/tratamientos')}>
                            <FaTooth size={18} />
                        </Link>
                        <Link href="/solicitudes" title="Solicitudes" aria-label="Solicitudes" className={linkClass('/solicitudes')}>
                            <FaClipboardList size={18} />
                        </Link>
                        <Link href="/calendario" title="Calendario" aria-label="Calendario" className={linkClass('/calendario')}>
                            <FaCalendarAlt size={18} />
                        </Link>
                        <div className="relative ml-1 sm:ml-2" ref={menuRef}>
                            <button
                                type="button"
                                onClick={() => setOpen(!open)}
                                className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-50"
                                title="Cuenta"
                                aria-label="Cuenta"
                                aria-expanded={open}
                            >
                                <FaUserCircle size={24} />
                            </button>

                            {open && (
                                <>
                                    <div
                                        className="fixed inset-0 bg-black/20 sm:hidden -z-10"
                                        onClick={() => setOpen(false)}
                                        aria-hidden="true"
                                    />

                                    <div className="absolute right-0 mt-2 w-56 sm:w-60 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">

                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                Alejandra Fernández
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Administrador
                                            </p>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                href="/perfil"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setOpen(false)}
                                            >
                                                <FaUser size={14} className="text-gray-400" />
                                                <span>Mi Cuenta</span>
                                            </Link>

                                            <Link
                                                href="/cambiar-password"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => setOpen(false)}
                                            >
                                                <FaLock size={14} className="text-gray-400" />
                                                <span>Contraseña</span>
                                            </Link>
                                        </div>

                                        <div className="border-t border-gray-100 pt-1">
                                            <button
                                                type="button"
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                                onClick={() => {
                                                    setOpen(false)
                                                }}
                                            >
                                                <FaSignOutAlt size={14} />
                                                <span>Cerrar Sesión</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    )
}