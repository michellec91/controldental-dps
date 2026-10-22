"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./LoginForm.module.css";
import { loginUsuario } from "../../../services/usuariosService";
import { useAuth } from "../../../context/AuthContext";

export default function LoginForm() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const { iniciarSesion } = useAuth();
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!correo.trim() || !contrasena.trim()) {
      setError("Ingresa tu correo electrónico y contraseña.");
      return;
    }

    try {
      setCargando(true);

      // El backend valida correo + contraseña con bcrypt.
      const usuario = await loginUsuario(
        correo.trim(),
        contrasena
      );

      // Esta página es exclusivamente administrativa.
      if (usuario.rol.toLowerCase() !== "administrador") {
        setError("Esta cuenta no tiene permisos administrativos.");
        return;
      }

      // Aunque el backend ya lo comprueba,
      // también lo validamos en el frontend.
      if (usuario.estado.toLowerCase() !== "activo") {
        setError("Esta cuenta no se encuentra activa.");
        return;
      }

      // Adaptamos los nombres de la BD a los que usa AuthContext.
      iniciarSesion({
        id: String(usuario.id_usuario),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        telefono: usuario.telefono,
        rol: usuario.rol,
        estado: usuario.estado,
        imagenPerfil:
          usuario.imagen_perfil || undefined,
      });

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "No fue posible conectar con el servidor. Verifica que la API esté activa."
        );
      }
    } finally {
      setCargando(false);
    }
  }

  return (
    <section className={styles.card} aria-labelledby="login-title">
      <div className={styles.content}>
        <div className={styles.iconCircle}>
          <Image
            src="/assets/IMG_1.svg"
            alt=""
            width={32}
            height={32}
          />
        </div>

        <h1 id="login-title" className={styles.title}>
          Acceso administrativo
        </h1>

        <p className={styles.subtitle}>
          Ingresa tus credenciales para continuar.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.label}>
              Correo electrónico
            </label>

            <div className={styles.inputContainer}>
              <Image
                src="/assets/IMG_2.svg"
                alt=""
                width={16}
                height={16}
                className={styles.inputIcon}
              />

              <input
                id="email"
                name="email"
                type="email"
                placeholder="nombre@clinica.com"
                className={styles.input}
                autoComplete="email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.passwordHeader}>
              <label htmlFor="password" className={styles.label}>
                Contraseña
              </label>

              <button
                type="button"
                className={styles.forgotPassword}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className={styles.inputContainer}>
              <Image
                src="/assets/IMG_3.svg"
                alt=""
                width={16}
                height={16}
                className={styles.inputIcon}
              />

              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={styles.input}
                autoComplete="current-password"
                value={contrasena}
                onChange={(event) => setContrasena(event.target.value)}
              />

              <button
                type="button"
                className={styles.visibilityButton}
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                <Image
                  src="/assets/IMG_4.svg"
                  alt=""
                  width={16}
                  height={16}
                />
              </button>
            </div>
          </div>

          {error && (
            <p
              style={{
                margin: 0,
                color: "#d32f2f",
                fontSize: "11px",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.loginButton}
            disabled={cargando}
          >
            <span>
              {cargando ? "Verificando..." : "Iniciar sesión"}
            </span>

            {!cargando && (
              <Image
                src="/assets/IMG_5.svg"
                alt=""
                width={16}
                height={16}
              />
            )}
          </button>

          <div className={styles.divider}>
            <span></span>
            <p>o</p>
            <span></span>
          </div>

          <button type="button" className={styles.googleButton}>
            <Image
              src="/assets/IMG_6.svg"
              alt=""
              width={16}
              height={16}
            />

            <span>Continuar con Google</span>
          </button>
        </form>

        <div className={styles.footerNote}>
          <Image
            src="/assets/IMG_7.svg"
            alt=""
            width={16}
            height={16}
          />

          <span>Acceso exclusivo para personal autorizado.</span>
        </div>
      </div>
    </section>
  );
}