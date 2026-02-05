/**
 * Componente reutilizable para mostrar KPIs (indicadores clave)
 * 
 * Props:
 * - title: Título de la tarjeta (ej: "Ingresos del Mes")
 * - value: Valor a mostrar (ej: 45000)
 * - icon: Emoji o ícono a mostrar
 * - color: Color del acento ('green', 'red', 'blue', 'orange')
 * - loading: Muestra un estado de carga
 */
const KPICard = ({ title, value, icon, color = 'blue', loading = false }) => {
  
  // Formatea el número como moneda argentina
  const formatearMoneda = (numero) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numero);
  };

  // Colores del borde según el tipo
  const colorClasses = {
    green: 'border-green-500',
    red: 'border-red-500',
    blue: 'border-blue-500',
    orange: 'border-orange-500',
  };

  return (
    <div className={`
      bg-white rounded-xl p-5 shadow-sm
      flex items-center gap-4
      border-l-4 ${colorClasses[color]}
      hover:shadow-md hover:-translate-y-0.5
      transition-all duration-200
    `}>
      
      {/* Ícono */}
      <div className="
        text-3xl w-14 h-14
        flex items-center justify-center
        bg-gray-100 rounded-lg
      ">
        {icon}
      </div>

      {/* Contenido */}
      <div className="flex-1">
        <p className="text-sm text-gray-600 font-medium">
          {title}
        </p>
        
        {loading ? (
          <div className="text-base text-gray-400 italic mt-1">
            Cargando...
          </div>
        ) : (
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatearMoneda(value)}
          </p>
        )}
      </div>
    </div>
  );
};

export default KPICard;