import React from 'react';
import { AlertTriangle } from 'lucide-react';

const AlertasPanel = ({ alertas }) => {
  // Función para obtener el color según el tipo
  const getAlertColor = (tipo) => {
    const colores = {
      danger: '#fee2e2',    // Rojo claro
      warning: '#fef3c7',   // Amarillo claro
      success: '#dcfce7',   // Verde claro
    };
    return colores[tipo] || colores.warning;
  };

  const getAlertBorder = (tipo) => {
    const colores = {
      danger: '#ef4444',    // Rojo
      warning: '#f59e0b',   // Amarillo
      success: '#22c55e',   // Verde
    };
    return colores[tipo] || colores.warning;
  };

  return (
    <div className="alertas-panel">
      {/* Header */}
      <div className="alertas-header">
        <AlertTriangle size={20} className="alertas-icon" />
        <h3 className="alertas-title">Alertas Importantes</h3>
      </div>

      {/* Lista de alertas */}
      <div className="alertas-list">
        {alertas.map((alerta, index) => (
          <div 
            key={index} 
            className="alerta-item"
            style={{
              backgroundColor: getAlertColor(alerta.tipo),
              borderLeftColor: getAlertBorder(alerta.tipo)
            }}
          >
            <div className="alerta-content">
              <h4 className="alerta-numero">{alerta.cantidad}</h4>
              <p className="alerta-titulo">{alerta.titulo}</p>
              <p className="alerta-descripcion">{alerta.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertasPanel;