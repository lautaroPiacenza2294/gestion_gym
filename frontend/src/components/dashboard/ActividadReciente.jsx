import { FileText, DollarSign, UserPlus, UserCheck, RefreshCw } from 'lucide-react';

const ActividadReciente = ({ actividades }) => {
  // Función para obtener el ícono según el tipo
  const getIcon = (tipo) => {
    const iconos = {
      pago: <DollarSign size={20} />,
      membresia_nueva: <UserCheck size={20} />,
      cliente_nuevo: <UserPlus size={20} />,
      renovacion: <RefreshCw size={20} />,
    };
    return iconos[tipo] || <FileText size={20} />;
  };

  // Función para obtener el color según el tipo
  const getIconColor = (tipo) => {
    const colores = {
      pago: '#22c55e',           // Verde
      membresia_nueva: '#3b82f6', // Azul
      cliente_nuevo: '#6366f1',   // Índigo
      renovacion: '#f59e0b',      // Naranja
    };
    return colores[tipo] || '#94a3b8';
  };

  return (
    <div className="actividad-reciente">
      {/* Header */}
      <div className="actividad-header">
        <FileText size={20} className="actividad-icon" />
        <h3 className="actividad-title">Actividad Reciente</h3>
      </div>

      {/* Grid de actividades */}
      <div className="actividad-grid">
        {actividades.map((actividad, index) => (
          <div key={index} className="actividad-item">
            {/* Ícono con color */}
            <div 
              className="actividad-icono"
              style={{ backgroundColor: getIconColor(actividad.tipo) }}
            >
              {getIcon(actividad.tipo)}
            </div>

            {/* Contenido */}
            <div className="actividad-contenido">
              <h4 className="actividad-titulo">{actividad.titulo}</h4>
              <p className="actividad-descripcion">{actividad.descripcion}</p>
            </div>

            {/* Hora */}
            <div className="actividad-hora">
              {actividad.hora}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActividadReciente;