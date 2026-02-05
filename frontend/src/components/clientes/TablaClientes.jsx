import { Eye, Edit2, Trash2 } from 'lucide-react';

const TablaClientes = ({ clientes, onVerDetalle, onEditar, onEliminar }) => {
  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-AR');
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Nombre</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Teléfono</th>
            <th className="px-4 py-3 text-left">Fecha Nac.</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(cliente => (
            <tr key={cliente.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">#{cliente.id}</td>
              <td className="px-4 py-2">{cliente.nombre} {cliente.apellido}</td>
              <td className="px-4 py-2">{cliente.email || '-'}</td>
              <td className="px-4 py-2">{cliente.telefono || '-'}</td>
              <td className="px-4 py-2">{formatearFecha(cliente.fecha_nacimiento)}</td>
              <td className="px-4 py-2">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  cliente.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {cliente.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-2">
                <div className="flex justify-center gap-2">
                  <button onClick={() => onVerDetalle(cliente)} className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => onEditar(cliente)} className="p-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => onEliminar(cliente)} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaClientes;
