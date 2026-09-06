"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

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

        <form
          className={styles.form}
          onSubmit={(event) => event.preventDefault()}
        >
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

          <button type="submit" className={styles.loginButton}>
            <span>Iniciar sesión</span>

            <Image
              src="/assets/IMG_5.svg"
              alt=""
              width={16}
              height={16}
            />
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