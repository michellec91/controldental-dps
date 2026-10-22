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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-xl font-bold text-gray-800">
            Agendar Nueva Cita
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

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