"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import {
    FaHome,
    FaTooth,
    FaCalendarAlt,
    FaRegCalendarCheck,
    FaClipboardList,
    FaUserCircle,
    FaSignOutAlt,
    FaLock,
    FaUser
} from "react-icons/fa"

import { useAuth } from "../context/AuthContext"

export default function Navbar() {
    const [open, setOpen] = useState(false)
    const menuRef = useRef(null)

    const pathname = usePathname()
    const router = useRouter()

    const {
        usuario,
        cerrarSesion
    } = useAuth()

    // -----------------------------------------
    // CERRAR MENÚ AL HACER CLIC FUERA
    // -----------------------------------------
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                setOpen(false)
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        )

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            )
    }, [])

    // -----------------------------------------
    // CERRAR MENÚ AL CAMBIAR DE PÁGINA
    // -----------------------------------------
    useEffect(() => {
        setOpen(false)
    }, [pathname])

    // -----------------------------------------
    // CERRAR MENÚ CON ESC
    // -----------------------------------------
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                setOpen(false)
            }
        }

        document.addEventListener(
            "keydown",
            handleEsc
        )

        return () =>
            document.removeEventListener(
                "keydown",
                handleEsc
            )
    }, [])

    // -----------------------------------------
    // ESTILO DE LOS ENLACES
    // -----------------------------------------
    const linkClass = (href) => {
    const active = pathname === href;

    return `p-2.5 rounded-lg transition-colors ${
        active
        ? "bg-[var(--primary-soft)] text-[var(--primary)]"
        : "text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-soft)]"
    }`;
    };

    // -----------------------------------------
    // CERRAR SESIÓN
    // -----------------------------------------
    const handleCerrarSesion = () => {
        cerrarSesion()
        setOpen(false)
        router.replace("/login")
    }

    return (
        <nav className="w-full bg-[var(--surface)] border-b border-[var(--border)] shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="flex items-center justify-between h-16">

                    {/* LOGO */}
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 shrink-0"
                    >
                        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--primary-soft)] text-[var(--primary)]">
                            <FaTooth size={18} />
                        </span>

                        <span className="text-base sm:text-lg font-semibold text-[var(--text)] hidden xs:inline">
                            Control Dental
                        </span>
                    </Link>

                    {/* NAVEGACIÓN */}
                    <div className="flex items-center gap-1 sm:gap-2">

                        {/* INICIO */}
                        <Link
                            href="/dashboard"
                            title="Inicio"
                            aria-label="Inicio"
                            className={linkClass(
                                "/dashboard"
                            )}
                        >
                            <FaHome size={18} />
                        </Link>

                        {/* TRATAMIENTOS */}
                        <Link
                            href="/tratamientos"
                            title="Tratamientos"
                            aria-label="Tratamientos"
                            className={linkClass(
                                "/tratamientos"
                            )}
                        >
                            <FaTooth size={18} />
                        </Link>

                        {/* SOLICITUDES */}
                        <Link
                            href="/solicitudes"
                            title="Solicitudes"
                            aria-label="Solicitudes"
                            className={linkClass(
                                "/solicitudes"
                            )}
                        >
                            <FaClipboardList size={18} />
                        </Link>

                        {/* CITAS */}
                        <Link
                            href="/citas"
                            title="Citas"
                            aria-label="Citas"
                            className={linkClass(
                                "/citas"
                            )}
                        >
                            <FaRegCalendarCheck size={18} />
                        </Link>

                        {/* AGENDA */}
                        <Link
                            href="/agenda"
                            title="Agenda"
                            aria-label="Agenda"
                            className={linkClass(
                                "/agenda"
                            )}
                        >
                            <FaCalendarAlt size={18} />
                        </Link>

                        {/* CUENTA */}
                        <div
                            className="relative ml-1 sm:ml-2"
                            ref={menuRef}
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setOpen(!open)
                                }
                                className="flex items-center justify-center w-10 h-10 text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors rounded-lg hover:bg-[var(--surface-soft)]"
                                title="Cuenta"
                                aria-label="Cuenta"
                                aria-expanded={open}
                            >
                                {usuario?.imagenPerfil ? (
                                    <span
                                        className="block w-8 h-8 rounded-full bg-cover bg-center bg-no-repeat"
                                        style={{
                                            backgroundImage:
                                                `url("${usuario.imagenPerfil}")`,
                                        }}
                                    />
                                ) : (
                                    <FaUserCircle
                                        size={24}
                                    />
                                )}
                            </button>

                            {open && (
                                <>
                                    {/* FONDO PARA MÓVIL */}
                                    <div
                                        className="fixed inset-0 bg-black/20 sm:hidden -z-10"
                                        onClick={() =>
                                            setOpen(false)
                                        }
                                        aria-hidden="true"
                                    />

                                    {/* MENÚ DESPLEGABLE */}
                                    <div className="absolute right-0 mt-2 w-56 sm:w-60 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg py-1.5 z-50">

                                        {/* INFORMACIÓN DEL USUARIO */}
                                        <div className="px-4 py-3 border-b border-[var(--border)]">
                                            <p className="text-sm font-semibold text-[var(--text)]">
                                                {usuario?.nombre ??
                                                    "Administrador"}
                                            </p>

                                            <p className="text-xs text-[var(--text-secondary)]">
                                                {usuario?.rol ??
                                                    "Administrador"}
                                            </p>
                                        </div>

                                        {/* OPCIONES DE CUENTA */}
                                        <div className="py-1">

                                            <Link
                                                href="/perfil"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--surface-soft)] transition-colors"
                                                onClick={() =>
                                                    setOpen(false)
                                                }
                                            >
                                                <FaUser
                                                    size={14}
                                                    className="text-gray-400"
                                                />

                                                <span>
                                                    Mi Cuenta
                                                </span>
                                            </Link>

                                            <Link
                                                href="/perfil/cambiar-password"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--surface-soft)] transition-colors"
                                                onClick={() =>
                                                    setOpen(false)
                                                }
                                            >
                                                <FaLock
                                                    size={14}
                                                    className="text-gray-400"
                                                />

                                                <span>
                                                    Contraseña
                                                </span>
                                            </Link>

                                        </div>

                                        {/* CERRAR SESIÓN */}
                                        <div className="border-t border-[var(--border)] pt-1">

                                            <button
                                                type="button"
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left"
                                                onClick={
                                                    handleCerrarSesion
                                                }
                                            >
                                                <FaSignOutAlt
                                                    size={14}
                                                />

                                                <span>
                                                    Cerrar Sesión
                                                </span>
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