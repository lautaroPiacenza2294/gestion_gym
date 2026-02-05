import React from 'react';
const KPICard = ({ 
  title,           // Título de la métrica (ej: "Clientes Activos")
  value,           // Valor principal (ej: 120)
  icon,            // Ícono del componente
  iconBg,          // Color de fondo del ícono
  change,          // Cambio porcentual (ej: "8%")
  changeText,      // Texto del cambio (ej: "vs mes anterior")
  trend            // 'up' o 'down' para mostrar flecha
}) => {
  return (
    <div className="kpi-card">
      {/* Contenido principal */}
      <div className="kpi-content">
        {/* Valor y título */}
        <div className="kpi-info">
          <h3 className="kpi-value">{value}</h3>
          <p className="kpi-title">{title}</p>
          
          {/* Indicador de cambio */}
          <div className={`kpi-change ${trend}`}>
            <span className="change-icon">
              {trend === 'up' ? '↑' : '↓'}
            </span>
            <span className="change-value">{change}</span>
            <span className="change-text">{changeText}</span>
          </div>
        </div>

        {/* Ícono */}
        <div className="kpi-icon" style={{ backgroundColor: iconBg }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;