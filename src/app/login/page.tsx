import Image from "next/image";
import LoginForm from "../../features/autenticacion/components/LoginForm";
import styles from "./page.module.css";

export default function LoginPage() {
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