import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

const FiltrosClientes = ({ onFilterChange, totalClientes, clientesFiltrados }) => {
  const [busqueda, setBusqueda] = useState('');
  const [estado, setEstado] = useState('todos');
  const [ordenPor, setOrdenPor] = useState('nombre');
  const [ordenDireccion, setOrdenDireccion] = useState('asc');

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        busqueda: busqueda.trim().toLowerCase(),
        estado,
        ordenPor,
        ordenDireccion
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda, estado, ordenPor, ordenDireccion]);

  const limpiarFiltros = () => {
    setBusqueda('');
    setEstado('todos');
    setOrdenPor('nombre');
    setOrdenDireccion('asc');
  };

  const hayFiltrosActivos = busqueda || estado !== 'todos' || ordenPor !== 'nombre';

  return (
    <div className="bg-white p-4 rounded-xl shadow space-y-4 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o DNI..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <select value={estado} onChange={e => setEstado(e.target.value)} className="border rounded-lg p-2">
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>

        <select value={ordenPor} onChange={e => setOrdenPor(e.target.value)} className="border rounded-lg p-2">
          <option value="nombre">Nombre</option>
          <option value="apellido">Apellido</option>
          <option value="fecha_nacimiento">Fecha de Nacimiento</option>
          <option value="dni">DNI</option>
        </select>

        <select value={ordenDireccion} onChange={e => setOrdenDireccion(e.target.value)} className="border rounded-lg p-2">
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>

        {hayFiltrosActivos && (
          <button
            onClick={limpiarFiltros}
            className="bg-gray-200 hover:bg-gray-300 rounded-lg px-3 py-2 text-sm font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="text-sm text-gray-600">
        {hayFiltrosActivos
          ? <>Mostrando <strong>{clientesFiltrados}</strong> de <strong>{totalClientes}</strong> clientes</>
          : <>Total: <strong>{totalClientes}</strong> clientes</>
        }
      </div>
    </div>
  );
};

export default FiltrosClientes;
