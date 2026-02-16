import { useState, useEffect, useMemo, useCallback } from 'react';
import { RefreshCcw, UserPlus, SearchX, AlertCircle, Loader2 } from 'lucide-react';
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
      setError('No pudimos conectar con el servidor. Verifica tu conexión.');
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

  const handleFilterChange = useCallback((nuevosFiltros) => {
    setFiltros(nuevosFiltros);
  }, []);

  // 🔄 Estado: Cargando
  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-100">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-gray-700">Actualizando lista</h3>
        <p className="text-sm text-gray-400">Sincronizando datos con el servidor...</p>
      </div>
    );
  }

  // ❌ Estado: Error
  if (error) {
    return (
      <div className="bg-white p-10 rounded-2xl border border-red-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">¡Ups! Algo salió mal</h3>
        <p className="text-gray-500 max-w-xs mx-auto mb-6">{error}</p>
        <button
          onClick={cargarClientes}
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-semibold transition-all active:scale-95 shadow-lg shadow-gray-200"
        >
          <RefreshCcw size={18} />
          Reintentar ahora
        </button>
      </div>
    );
  }

  // 📭 Estado: Sin clientes (Base de datos vacía)
  if (clientes.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <UserPlus size={40} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay clientes aún</h3>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Comienza a digitalizar tu agenda agregando a tu primer cliente.
        </p>
        {/* Aquí podrías disparar el modal de nuevo cliente si pasas la prop */}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Contenedor de Filtros con fondo suave */}
      <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
        <FiltrosClientes 
          onFilterChange={handleFilterChange}
          totalClientes={clientes.length}
          clientesFiltrados={clientesFiltrados.length}
        />
      </div>

      {/* Resultado de la búsqueda */}
      {clientesFiltrados.length === 0 ? (
        <div className="bg-gray-50/50 border border-gray-100 p-16 rounded-2xl text-center">
          <div className="bg-white w-16 h-16 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-400">
            <SearchX size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Sin coincidencias</h3>
          <p className="text-gray-500 mt-1">
            No encontramos resultados para "<span className="font-semibold text-gray-700">{filtros.busqueda}</span>"
          </p>
          <button 
            onClick={() => setFiltros({ ...filtros, busqueda: '', estado: 'todos' })}
            className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
          >
            Limpiar todos los filtros
          </button>
        </div>
      ) : (
        <div className="transform transition-all">
          <TablaClientes 
            clientes={clientesFiltrados}
            onVerDetalle={onVerDetalle}
            onEditar={onEditar}
            onEliminar={onEliminar}
          />
          
          {/* Footer de información */}
          <div className="mt-4 px-4 flex justify-between items-center text-xs font-medium text-gray-400 uppercase tracking-widest">
            <span>Mostrando {clientesFiltrados.length} de {clientes.length} clientes</span>
            <span className="flex items-center gap-1 italic">
              <RefreshCcw size={12} /> Actualizado recientemente
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaClientes;