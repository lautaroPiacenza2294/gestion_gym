import { useState, useEffect, useMemo } from 'react';
import { clientesAPI } from '../../services';
import TablaClientes from './TablaClientes';
import FiltrosClientes from './FiltrosClientes';

const ListaClientes = ({ onVerDetalle, onEditar, onEliminar, refresh }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    estado: 'todos',
    ordenPor: 'nombre',
    ordenDireccion: 'asc'
  });

  const cargarClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clientesAPI.getAll();
      setClientes(response.data);
    } catch (err) {
      console.error('Error cargando clientes:', err);
      setError('Error al cargar los clientes. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, [refresh]);

  const clientesFiltrados = useMemo(() => {
    let resultado = [...clientes];

    if (filtros.busqueda) {
      resultado = resultado.filter(cliente => {
        const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
        const dni = cliente.dni?.toLowerCase() || '';
        const busqueda = filtros.busqueda.toLowerCase();
        return nombreCompleto.includes(busqueda) || dni.includes(busqueda);
      });
    }

    if (filtros.estado !== 'todos') {
      const esActivo = filtros.estado === 'activos';
      resultado = resultado.filter(cliente => cliente.activo === esActivo);
    }

    resultado.sort((a, b) => {
      let valorA, valorB;

      switch (filtros.ordenPor) {
        case 'nombre':
          valorA = a.nombre?.toLowerCase() || '';
          valorB = b.nombre?.toLowerCase() || '';
          break;
        case 'apellido':
          valorA = a.apellido?.toLowerCase() || '';
          valorB = b.apellido?.toLowerCase() || '';
          break;
        case 'dni':
          valorA = a.dni || '';
          valorB = b.dni || '';
          break;
        case 'fecha_nacimiento':
          valorA = a.fecha_nacimiento || '';
          valorB = b.fecha_nacimiento || '';
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return filtros.ordenDireccion === 'asc' ? -1 : 1;
      if (valorA > valorB) return filtros.ordenDireccion === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [clientes, filtros]);

  const handleFilterChange = (nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  };

  // 🔄 Loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-600">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p>Cargando clientes...</p>
      </div>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-6 rounded-xl text-center shadow">
        <p>{error}</p>
        <button
          onClick={cargarClientes}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // 📭 Sin clientes
  if (clientes.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow text-center text-gray-600">
        <p className="text-lg font-medium">No hay clientes registrados todavía.</p>
        <p className="text-sm mt-2">Haz clic en "Nuevo Cliente" para agregar el primero.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FiltrosClientes 
        onFilterChange={handleFilterChange}
        totalClientes={clientes.length}
        clientesFiltrados={clientesFiltrados.length}
      />

      {clientesFiltrados.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-700 p-6 rounded-xl text-center shadow">
          <p className="font-medium">No se encontraron clientes con los filtros aplicados.</p>
          <p className="text-sm mt-2">Intenta ajustar los filtros de búsqueda.</p>
        </div>
      ) : (
        <TablaClientes 
          clientes={clientesFiltrados}
          onVerDetalle={onVerDetalle}
          onEditar={onEditar}
          onEliminar={onEliminar}
        />
      )}
    </div>
  );
};

export default ListaClientes;
