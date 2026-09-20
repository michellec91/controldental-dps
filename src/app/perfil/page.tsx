"use client";

import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../features/autenticacion/components/ProtectedRoute";
import PerfilCard from "../../features/dashboard-perfil/components/PerfilCard";
import styles from "./page.module.css";

export default function PerfilPage() {
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
        </main>
      </div>
    </ProtectedRoute>
  );
}