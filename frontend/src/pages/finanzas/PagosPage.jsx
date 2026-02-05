import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ModalRegistrarPago from '../../components/finanzas/ModalRegistrarPago';
import { pagosAPI } from '../../services/finanzas';

const PagosPage = () => {
  const navigate = useNavigate();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    cargarPagos();
  }, []);

  const cargarPagos = async () => {
    setLoading(true);
    try {
      const response = await pagosAPI.getAll();
      setPagos(response.data);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModal = () => {
    setModalOpen(true);
  };

  const handleCerrarModal = () => {
    setModalOpen(false);
  };

  const handleRegistroExitoso = () => {
    cargarPagos();
  };

  // Formatea la fecha
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

  // Traduce el método de pago
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

  // Traduce el concepto
  const traducirConcepto = (concepto) => {
    const traducciones = {
      'membresia': 'Membresía',
      'inscripcion': 'Inscripción',
      'clase_particular': 'Clase Particular',
      'producto': 'Venta de Producto',
      'otro': 'Otro',
    };
    return traducciones[concepto] || concepto;
  };

  return (
    <Layout title="Gestión de Pagos">
      <div className="p-6 bg-gray-50 min-h-screen">
        
        {/* Header con botones */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Todos los Pagos
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Total: {pagos.length} pagos registrados
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/finanzas')}
              className="
                bg-gray-200 hover:bg-gray-300
                text-gray-700 font-medium
                px-4 py-2 rounded-lg
                transition-colors duration-200
              "
            >
              ← Volver al Dashboard
            </button>

            <button
              onClick={handleAbrirModal}
              className="
                bg-blue-600 hover:bg-blue-700
                text-white font-medium
                px-4 py-2 rounded-lg
                transition-colors duration-200
                flex items-center gap-2
              "
            >
              <span className="text-lg">➕</span>
              Registrar Pago
            </button>
          </div>
        </div>

        {/* Tabla de pagos */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              Cargando pagos...
            </div>
          ) : pagos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No hay pagos registrados</p>
              <button
                onClick={handleAbrirModal}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Registrar el primer pago →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Cliente
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Concepto
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
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((pago) => (
                    <tr 
                      key={pago.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        #{pago.id}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                        {pago.cliente_nombre || 'Sin nombre'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {traducirConcepto(pago.concepto)}
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
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => alert(`Ver detalle del pago #${pago.id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Modal de registro */}
      <ModalRegistrarPago
        isOpen={modalOpen}
        onClose={handleCerrarModal}
        onSuccess={handleRegistroExitoso}
      />
    </Layout>
  );
};

export default PagosPage;