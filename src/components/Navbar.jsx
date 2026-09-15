"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { FaHome, FaTooth, FaCalendarAlt, FaUserCircle } from "react-icons/fa"

export default function Navbar() {
    const [open, setOpen] = useState(false)
    const menuRef = useRef(null)

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <nav className="w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="px-8 py-3 flex items-center justify-between">
                {/* Logo / Marca */}
                <div className="flex items-center space-x-2">
                    <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 text-blue-600">
                        <FaTooth size={18} />
                    </span>
                    <span className="text-lg font-semibold text-gray-800">
                        Control Dental
                    </span>
                </div>

                {/* Iconos derecha */}
                <div className="flex items-center space-x-6 text-gray-700">
                    <Link href="/" title="Inicio" aria-label="Inicio" className="hover:text-blue-600 transition-colors">
                        <FaHome size={20} />
                    </Link>
                    <Link href="/tratamientos" title="Tratamientos" aria-label="Tratamientos" className="hover:text-blue-600 transition-colors">
                        <FaTooth size={20} />
                    </Link>
                    <Link href="/calendario" title="Calendario" aria-label="Calendario" className="hover:text-blue-600 transition-colors">
                        <FaCalendarAlt size={20} />
                    </Link>

                    {/* Dropdown usuario */}
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            onClick={() => setOpen(!open)}
                            className="text-gray-700 hover:text-blue-600 transition-colors"
                            title="Cuenta"
                            aria-label="Cuenta"
                        >
                            <FaUserCircle size={26} />
                        </button>

                        {open && (
                            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-semibold text-gray-800">Alejandra Fernández</p>
                                    <p className="text-xs text-gray-500">Administrador</p>
                                </div>

                                <Link
                                    href="/perfil"
                                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    onClick={() => setOpen(false)}
                                >
                                    <FaUserCircle size={16} />
                                    <span>Mi Cuenta</span>
                                </Link>

                                <Link
                                    href="/cambiar-password"
                                    className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    onClick={() => setOpen(false)}
                                >
                                    <span className="w-4 text-center">🔒</span>
                                    <span>Contraseña</span>
                                </Link>

                                <button
                                    type="button"
                                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                    onClick={() => {
                                        setOpen(false)
                                        // aquí tu lógica de logout
                                        // localStorage.removeItem('token')
                                        // router.push('/login')
                                    }}
                                >
                                    <span className="w-4 text-center">↪</span>
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}