import { Eye, Edit2, Trash2, User } from 'lucide-react';

const TablaClientes = ({ clientes = [], onVerDetalle, onEditar, onEliminar }) => {
  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Nac.</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100" key={clientes.map(c => c.id).join('-')}>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">
                  No se encontraron clientes en la base de datos.
                </td>
              </tr>
            ) : (
              clientes.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-blue-50/30 transition-colors duration-150 ease-in-out group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                      #{cliente.id}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        <User size={18} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900 leading-tight">
                          {cliente.nombre} {cliente.apellido}
                        </div>
                        <div className="text-xs text-gray-500">{cliente.email || 'Sin email'}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {cliente.telefono || <span className="text-gray-300">N/A</span>}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatearFecha(cliente.fecha_nacimiento)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      cliente.activo 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${cliente.activo ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {cliente.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  {/* ========================================
                      🎨 AQUÍ EMPIEZAN LOS CAMBIOS EN LOS BOTONES
                      ======================================== */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center items-center gap-2"> {/* ✏️ CAMBIO 1: gap-1 → gap-2 (más espacio entre botones) */}
                      {/* Botón Ver - Ahora con fondo azul */}
                      <button
                        onClick={() => onVerDetalle(cliente)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-200 hover:shadow-md" 
                        /* ✏️ CAMBIO 2: Ahora tiene fondo azul claro (bg-blue-50), texto azul (text-blue-600), 
                            y al hacer hover se oscurece (hover:bg-blue-100) y agrega sombra (hover:shadow-md) */
                        title="Ver detalle"
                      >
                        <Eye size={18} />
                      </button>

                      {/* Botón Editar - Ahora con fondo ámbar */}
                      <button
                        onClick={() => onEditar(cliente)}
                        className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 rounded-lg transition-all duration-200 hover:shadow-md"
                        /* ✏️ CAMBIO 3: Ahora tiene fondo ámbar claro (bg-amber-50), texto ámbar (text-amber-600),
                            y al hacer hover se oscurece (hover:bg-amber-100) y agrega sombra (hover:shadow-md) */
                        title="Editar cliente"
                      >
                        <Edit2 size={18} />
                      </button>

                      {/* Botón Eliminar - Ahora con fondo rojo */}
                      <button
                        onClick={() => onEliminar(cliente)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-all duration-200 hover:shadow-md"
                        /* ✏️ CAMBIO 4: Ahora tiene fondo rojo claro (bg-red-50), texto rojo (text-red-600),
                            y al hacer hover se oscurece (hover:bg-red-100) y agrega sombra (hover:shadow-md) */
                        title="Eliminar cliente"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                  {/* ========================================
                      🎨 AQUÍ TERMINAN LOS CAMBIOS EN LOS BOTONES
                      ======================================== */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaClientes;