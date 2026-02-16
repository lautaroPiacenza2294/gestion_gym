import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ModalGastoFijo from '../../components/finanzas/ModalGastoFijo';
import KPICard from '../../components/finanzas/KPICard';
import { gastosFijosAPI } from '../../services/finanzas';

const GastosFijosPage = () => {
  const navigate = useNavigate();
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTotal, setLoadingTotal] = useState(true);
  const [totalMensual, setTotalMensual] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [gastoToEdit, setGastoToEdit] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await Promise.all([
      cargarGastos(),
      cargarTotalMensual(),
    ]);
  };

  const cargarGastos = async () => {
    setLoading(true);
    try {
      const response = await gastosFijosAPI.getAll();
      setGastos(response.data);
    } catch (error) {
      console.error('Error al cargar gastos fijos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarTotalMensual = async () => {
    setLoadingTotal(true);
    try {
      const response = await gastosFijosAPI.getTotalMensual();
      setTotalMensual(response.data.total || 0);
    } catch (error) {
      console.error('Error al cargar total mensual:', error);
    } finally {
      setLoadingTotal(false);
    }
  };

  const handleAbrirModal = () => {
    setGastoToEdit(null);
    setModalOpen(true);
  };

  const handleEditar = (gasto) => {
    setGastoToEdit(gasto);
    setModalOpen(true);
  };

  const handleEliminar = async (gasto) => {
    if (!window.confirm(`¿Estas seguro de eliminar "${gasto.nombre}"?`)) {
      return;
    }
    try {
      await gastosFijosAPI.delete(gasto.id);
      cargarDatos();
    } catch (error) {
      console.error('Error al eliminar gasto fijo:', error);
      alert('Error al eliminar el gasto fijo');
    }
  };

  const handleToggleActivo = async (gasto) => {
    try {
      await gastosFijosAPI.partialUpdate(gasto.id, { activo: !gasto.activo });
      cargarDatos();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del gasto');
    }
  };

  const handleCerrarModal = () => {
    setModalOpen(false);
    setGastoToEdit(null);
  };

  const handleRegistroExitoso = () => {
    cargarDatos();
  };

  const formatearMoneda = (monto) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(monto);
  };

  const traducirCategoria = (categoria) => {
    const traducciones = {
      'alquiler': 'Alquiler',
      'servicios': 'Servicios (luz, agua, gas)',
      'internet': 'Internet/Telefono',
      'salarios': 'Salarios',
      'impuestos': 'Impuestos',
      'seguro': 'Seguros',
      'limpieza': 'Limpieza',
      'otro': 'Otro',
    };
    return traducciones[categoria] || categoria;
  };

  return (
    <Layout title="Gastos Fijos">
      <div className="p-6 bg-gray-50 min-h-screen">

        {/* Header con botones */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Gastos Fijos Mensuales
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {gastos.filter(g => g.activo).length} activos de {gastos.length} totales
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
              <span className="text-lg">+</span>
              Agregar Gasto Fijo
            </button>
          </div>
        </div>

        {/* KPI - Total mensual */}
        <div className="mb-6 max-w-sm">
          <KPICard
            title="Total Gastos Fijos / Mes"
            value={totalMensual}
            icon="📋"
            color="orange"
            loading={loadingTotal}
          />
        </div>

        {/* Tabla de gastos fijos */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              Cargando gastos fijos...
            </div>
          ) : gastos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No hay gastos fijos registrados</p>
              <button
                onClick={handleAbrirModal}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Agregar el primer gasto fijo →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Nombre
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Categoria
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                      Monto Mensual
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                      Dia Vto.
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                      Estado
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((gasto) => (
                    <tr
                      key={gasto.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${!gasto.activo ? 'opacity-50' : ''}`}
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                        {gasto.nombre}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {traducirCategoria(gasto.categoria)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-orange-600 text-right">
                        {formatearMoneda(gasto.monto_mensual)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-center">
                        {gasto.dia_vencimiento}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`
                          inline-block px-2 py-1 rounded-full text-xs font-medium
                          ${gasto.activo
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                          }
                        `}>
                          {gasto.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditar(gasto)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleActivo(gasto)}
                            className={`text-sm font-medium ${
                              gasto.activo
                                ? 'text-yellow-600 hover:text-yellow-800'
                                : 'text-green-600 hover:text-green-800'
                            }`}
                          >
                            {gasto.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleEliminar(gasto)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Modal de registro/edicion */}
      <ModalGastoFijo
        isOpen={modalOpen}
        onClose={handleCerrarModal}
        onSuccess={handleRegistroExitoso}
        gastoToEdit={gastoToEdit}
      />
    </Layout>
  );
};

export default GastosFijosPage;
