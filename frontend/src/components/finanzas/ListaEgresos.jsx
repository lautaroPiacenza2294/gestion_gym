/**
 * Componente que muestra una lista simple de los últimos egresos
 * 
 * Props:
 * - egresos: Array de objetos con los egresos
 * - loading: Estado de carga
 */
const ListaEgresos = ({ egresos = [], loading = false }) => {
  
  // Formatea la fecha en formato legible
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatea el monto
  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  // Traduce la categoría a texto legible
  const traducirCategoria = (categoria) => {
    const traducciones = {
      'gastos_fijos': 'Gastos Fijos',
      'equipamiento': 'Equipamiento',
      'mantenimiento': 'Mantenimiento',
      'reparaciones': 'Reparaciones',
      'insumos': 'Insumos',
      'marketing': 'Marketing',
      'suplementos': 'Suplementos',
      'servicios_profesionales': 'Servicios Prof.',
      'otro': 'Otro',
    };
    return traducciones[categoria] || categoria;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Últimos Egresos
        </h3>
        <div className="text-center py-8 text-gray-400">
          Cargando egresos...
        </div>
      </div>
    );
  }

  if (egresos.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Últimos Egresos
        </h3>
        <div className="text-center py-8 text-gray-400">
          No hay egresos registrados
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📋 Últimos Egresos
      </h3>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                Descripción
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                Categoría
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                Monto
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody>
            {egresos.map((egreso, index) => (
              <tr 
                key={egreso.id || index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-900">
                  {egreso.descripcion}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {traducirCategoria(egreso.categoria)}
                </td>
                <td className="py-3 px-4 text-sm font-semibold text-red-600 text-right">
                  {formatearMoneda(egreso.monto)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 text-right">
                  {formatearFecha(egreso.fecha)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaEgresos;