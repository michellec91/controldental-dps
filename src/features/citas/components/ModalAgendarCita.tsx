"use client";

import { FormAgendarCita } from "./FormAgendarCita";

interface ModalAgendarCitaProps {
  isOpen: boolean;
  onClose: () => void;
  onCitaCreada: () => void;
}

export function ModalAgendarCita({
  isOpen,
  onClose,
  onCitaCreada,
}: ModalAgendarCitaProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50

        flex
        items-center
        justify-center

        bg-black/55

        p-4

        backdrop-blur-sm
      "
    >
      <div
        className="
          w-full
          max-w-md

          rounded-2xl

          bg-[var(--surface)]

          border
          border-[var(--border)]

          p-6

          shadow-2xl

          space-y-4

          text-[var(--text)]
        "
      >
        {/* CABECERA */}
        <div
          className="
            flex
            items-center
            justify-between

            border-b
            border-[var(--border)]

            pb-4
          "
        >
          <div>
            <h2 className="text-xl font-bold text-[var(--text)]">
              Agendar Nueva Cita
            </h2>

            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Completa la información para registrar una nueva cita.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="
              w-9
              h-9

              flex
              items-center
              justify-center

              rounded-lg

              text-[var(--text-secondary)]

              hover:bg-[var(--surface-hover)]
              hover:text-[var(--text)]

              transition-colors
            "
          >
            ✕
          </button>
        </div>

        {/* FORMULARIO */}
        <FormAgendarCita
          onCitaCreada={async () => {
            await onCitaCreada();
            onClose();
          }}
        />
      </div>
    </div>
  );
}