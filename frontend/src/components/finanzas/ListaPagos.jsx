/**
 * Componente que muestra una lista simple de los últimos pagos
 * 
 * Props:
 * - pagos: Array de objetos con los pagos
 * - loading: Estado de carga
 */
const ListaPagos = ({ pagos = [], loading = false }) => {
  
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

  // Traduce el método de pago a texto legible
  const traducirMetodoPago = (metodo) => {
    const traducciones = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'tarjeta_debito': 'Tarjeta Débito',
      'tarjeta_credito': 'Tarjeta Crédito',
      'mercadopago': 'Mercado Pago',
    };
    return traducciones[metodo] || metodo;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Últimos Pagos
        </h3>
        <div className="text-center py-8 text-gray-400">
          Cargando pagos...
        </div>
      </div>
    );
  }

  if (pagos.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Últimos Pagos
        </h3>
        <div className="text-center py-8 text-gray-400">
          No hay pagos registrados
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📋 Últimos Pagos
      </h3>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                Cliente
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                Monto
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                Método
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago, index) => (
              <tr 
                key={pago.id || index}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-gray-900">
                  {pago.cliente_nombre || 'Sin nombre'}
                </td>
                <td className="py-3 px-4 text-sm font-semibold text-green-600 text-right">
                  {formatearMoneda(pago.monto)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {traducirMetodoPago(pago.metodo_pago)}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600 text-right">
                  {formatearFecha(pago.fecha_pago)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListaPagos;