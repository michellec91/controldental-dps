"use client";

interface AgendaFiltrosProps {
  fechaFiltro: string;
  setFechaFiltro: (fecha: string) => void;
  estadoFiltro: string;
  setEstadoFiltro: (estado: string) => void;
}

export function AgendaFiltros({
  fechaFiltro,
  setFechaFiltro,
  estadoFiltro,
  setEstadoFiltro,
}: AgendaFiltrosProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-800">Filtros de búsqueda</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Por fecha:</label>
          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Por estado:</label>
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-2.5 outline-none focus:border-blue-500"
          >
            <option value="todos">Todos los estados</option>
            <option value="confirmada">Confirmadas</option>
            <option value="pendiente">Pendientes</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setFechaFiltro("");
              setEstadoFiltro("todos");
            }}
            className="w-full rounded-lg bg-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-300"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}