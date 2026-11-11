"use client";

import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../features/autenticacion/components/ProtectedRoute";
import PerfilCard from "../../features/dashboard-perfil/components/PerfilCard";
import { useTheme } from "../../context/ThemeContext";
import styles from "./page.module.css";

export default function PerfilPage() {
  const {
    theme,
    resolvedTheme,
    setTheme,
  } = useTheme();

  return (
    <ProtectedRoute>
      <div className={styles.page}>
        <Navbar />

        <main className={styles.container}>
          <header className={styles.header}>
            <h1>Mi perfil</h1>

            <p>
              Gestiona la información y seguridad de tu cuenta
              administrativa.
            </p>
          </header>

          <PerfilCard />

          {/* APARIENCIA */}
          <section className={styles.appearanceCard}>
            <div className={styles.appearanceHeader}>
              <div>
                <h2>Apariencia</h2>

                <p>
                  Selecciona cómo quieres visualizar la plataforma
                  administrativa.
                </p>
              </div>

              <span className={styles.currentTheme}>
                Tema actual:{" "}
                {resolvedTheme === "dark"
                  ? "Oscuro"
                  : "Claro"}
              </span>
            </div>

            <div className={styles.themeOptions}>
              {/* CLARO */}
              <button
                type="button"
                className={`${styles.themeButton} ${
                  theme === "light"
                    ? styles.themeButtonActive
                    : ""
                }`}
                onClick={() => setTheme("light")}
              >
                <span className={styles.themeIcon}>
                  ☀️
                </span>

                <span>
                  <strong>Claro</strong>
                  <small>
                    Usa siempre el tema claro
                  </small>
                </span>
              </button>

              {/* OSCURO */}
              <button
                type="button"
                className={`${styles.themeButton} ${
                  theme === "dark"
                    ? styles.themeButtonActive
                    : ""
                }`}
                onClick={() => setTheme("dark")}
              >
                <span className={styles.themeIcon}>
                  🌙
                </span>

                <span>
                  <strong>Oscuro</strong>
                  <small>
                    Usa siempre el tema oscuro
                  </small>
                </span>
              </button>

              {/* AUTOMÁTICO */}
              <button
                type="button"
                className={`${styles.themeButton} ${
                  theme === "system"
                    ? styles.themeButtonActive
                    : ""
                }`}
                onClick={() => setTheme("system")}
              >
                <span className={styles.themeIcon}>
                  💻
                </span>

                <span>
                  <strong>Automático</strong>
                  <small>
                    Sigue el tema del sistema
                  </small>
                </span>
              </button>
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}