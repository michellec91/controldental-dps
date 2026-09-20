"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoginForm from "../../features/autenticacion/components/LoginForm";
import { useAuth } from "../../context/AuthContext";
import styles from "./page.module.css";

export default function LoginPage() {
  const { usuario, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && usuario) {
      router.replace("/dashboard");
    }
  }, [usuario, cargando, router]);

  if (cargando || usuario) {
    return null;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Image
              src="/assets/IMG_1.svg"
              alt=""
              width={24}
              height={24}
            />
          </div>

          <span>Control Dental</span>
        </div>

        <button type="button" className={styles.helpButton}>
          Ayuda técnica
        </button>
      </header>

      <main className={styles.main}>
        <LoginForm />
      </main>
    </div>
  );
}