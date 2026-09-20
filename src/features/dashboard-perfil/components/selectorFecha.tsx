"use client";

import { useEffect, useRef, useState } from "react";
import { FaCalendarAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./selectorFecha.module.css";

interface SelectorFechaProps {
  fecha: string;
  onChange: (fecha: string) => void;
}

export default function SelectorFecha({
  fecha,
  onChange,
}: SelectorFechaProps) {
  const [abierto, setAbierto] = useState(false);

  const [year, month, day] = fecha.split("-").map(Number);

  const [mesVisible, setMesVisible] = useState(
    new Date(year, month - 1, 1)
  );

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function cerrar(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setAbierto(false);
      }
    }

    document.addEventListener("mousedown", cerrar);

    return () => {
      document.removeEventListener("mousedown", cerrar);
    };
  }, []);

  const nombreMes = new Intl.DateTimeFormat("es-SV", {
    month: "long",
    year: "numeric",
  }).format(mesVisible);

  const primerDia = new Date(
    mesVisible.getFullYear(),
    mesVisible.getMonth(),
    1
  );

  const ultimoDia = new Date(
    mesVisible.getFullYear(),
    mesVisible.getMonth() + 1,
    0
  );

  const desplazamiento = primerDia.getDay();

  const dias: (number | null)[] = [];

  for (let i = 0; i < desplazamiento; i++) {
    dias.push(null);
  }

  for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
    dias.push(dia);
  }

  function seleccionarDia(diaSeleccionado: number) {
    const y = mesVisible.getFullYear();
    const m = String(mesVisible.getMonth() + 1).padStart(2, "0");
    const d = String(diaSeleccionado).padStart(2, "0");

    onChange(`${y}-${m}-${d}`);
    setAbierto(false);
  }

  function cambiarMes(cantidad: number) {
    setMesVisible(
      new Date(
        mesVisible.getFullYear(),
        mesVisible.getMonth() + cantidad,
        1
      )
    );
  }

  const fechaVisual = `${String(day).padStart(2, "0")}/${String(
    month
  ).padStart(2, "0")}/${year}`;

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        type="button"
        className={`${styles.selector} ${
          abierto ? styles.selectorActivo : ""
        }`}
        onClick={() => setAbierto((valor) => !valor)}
      >
        <FaCalendarAlt className={styles.mainIcon} />

        <div className={styles.dateText}>
          <span>Consultar fecha</span>
          <strong>{fechaVisual}</strong>
        </div>
        
      </button>

      {abierto && (
        <div className={styles.calendar}>
          <div className={styles.calendarHeader}>
            <button
              type="button"
              onClick={() => cambiarMes(-1)}
            >
              <FaChevronLeft />
            </button>

            <strong>{nombreMes}</strong>

            <button
              type="button"
              onClick={() => cambiarMes(1)}
            >
              <FaChevronRight />
            </button>
          </div>

          <div className={styles.weekDays}>
            <span>DO</span>
            <span>LU</span>
            <span>MA</span>
            <span>MI</span>
            <span>JU</span>
            <span>VI</span>
            <span>SA</span>
          </div>

          <div className={styles.days}>
            {dias.map((numeroDia, index) => {
              if (numeroDia === null) {
                return <span key={`empty-${index}`} />;
              }

              const seleccionado =
                numeroDia === day &&
                mesVisible.getMonth() === month - 1 &&
                mesVisible.getFullYear() === year;

              return (
                <button
                  key={numeroDia}
                  type="button"
                  className={
                    seleccionado ? styles.selected : ""
                  }
                  onClick={() => seleccionarDia(numeroDia)}
                >
                  {numeroDia}
                </button>
              );
            })}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={() => {
                const hoy = new Date();

                const y = hoy.getFullYear();
                const m = String(hoy.getMonth() + 1).padStart(2, "0");
                const d = String(hoy.getDate()).padStart(2, "0");

                onChange(`${y}-${m}-${d}`);
                setMesVisible(
                  new Date(y, hoy.getMonth(), 1)
                );
                setAbierto(false);
              }}
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}