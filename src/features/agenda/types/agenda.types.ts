export interface Cita {
  id: string | number;
  pacienteNombre: string;
  pacienteId?: string;
  tratamientoId?: string;
  tratamientoNombre: string;
  fecha: string; // Formato YYYY-MM-DD
  hora: string;  // Formato HH:MM AM/PM (ej. "09:00 AM")
  estado: "confirmada" | "cancelada" | "pendiente";
}