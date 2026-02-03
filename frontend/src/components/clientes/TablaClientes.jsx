import { Eye, Edit2, Trash2 } from 'lucide-react';
import './clientes.css';

const TablaClientes = ({ clientes, onVerDetalle, onEditar, onEliminar }) => {
  
  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="tabla-clientes-container">
      <table className="tabla-clientes">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Fecha Nacimiento</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>#{cliente.id}</td>
              <td>{cliente.nombre} {cliente.apellido}</td>
              <td>{cliente.email || '-'}</td>
              <td>{cliente.telefono || '-'}</td>
              <td>{formatearFecha(cliente.fecha_nacimiento)}</td>
              <td>
                <span className={`badge-estado ${cliente.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                  {cliente.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <div className="acciones-cell">
                  <button 
                    className="btn-accion btn-ver"
                    onClick={() => onVerDetalle(cliente)}
                    title="Ver detalles de membresía"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    className="btn-accion btn-editar"
                    onClick={() => onEditar(cliente)}
                    title="Editar cliente"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    className="btn-accion btn-eliminar"
                    onClick={() => onEliminar(cliente)}
                    title="Eliminar cliente"
                  >
                    <Trash2 size={18} />
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