import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import ModalEgreso from '../../components/finanzas/ModalEgreso';
import { egresosAPI } from '../../services/finanzas';

const EgresosPage = () => {
  const navigate = useNavigate();
  const [egresos, setEgresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [egresoToEdit, setEgresoToEdit] = useState(null);

  useEffect(() => {
    cargarEgresos();
  }, []);

  const cargarEgresos = async () => {
    setLoading(true);
    try {
      const response = await egresosAPI.getAll();
      setEgresos(response.data);
    } catch (error) {
      console.error('Error al cargar egresos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModal = () => {
    setEgresoToEdit(null);
    setModalOpen(true);
  };

  const handleEditar = (egreso) => {
    setEgresoToEdit(egreso);
    setModalOpen(true);
  };

  const handleEliminar = async (egreso) => {
    if (!window.confirm(`¿Estás seguro de eliminar el egreso "${egreso.descripcion}"?`)) {
      return;
    }
    try {
      await egresosAPI.delete(egreso.id);
      cargarEgresos();
    } catch (error) {
      console.error('Error al eliminar egreso:', error);
      alert('Error al eliminar el egreso');
    }
  };

  const handleCerrarModal = () => {
    setModalOpen(false);
    setEgresoToEdit(null);
  };

  const handleRegistroExitoso = () => {
    cargarEgresos();
  };

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
      'equipamiento': 'Equipamiento',
      'mantenimiento': 'Mantenimiento',
      'reparaciones': 'Reparaciones',
      'insumos': 'Insumos de Limpieza',
      'marketing': 'Marketing/Publicidad',
      'suplementos': 'Suplementos/Productos',
      'servicios_profesionales': 'Servicios Prof.',
      'otro': 'Otro',
    };
    return traducciones[categoria] || categoria;
  };

  const traducirMetodoPago = (metodo) => {
    const traducciones = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'tarjeta_debito': 'Tarjeta Debito',
      'tarjeta_credito': 'Tarjeta Credito',
    };
    return traducciones[metodo] || metodo;
  };

  return (
    <Layout title="Gestion de Egresos">
      <div className="p-6 bg-gray-50 min-h-screen">

        {/* Header con botones */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Todos los Egresos
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Total: {egresos.length} egresos registrados
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
              Registrar Egreso
            </button>
          </div>
        </div>

        {/* Tabla de egresos */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              Cargando egresos...
            </div>
          ) : egresos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No hay egresos registrados</p>
              <button
                onClick={handleAbrirModal}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Registrar el primer egreso →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Descripcion
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Categoria
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                      Monto
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Metodo
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Proveedor
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
                  {egresos.map((egreso) => (
                    <tr
                      key={egreso.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                        {egreso.descripcion}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {traducirCategoria(egreso.categoria)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-red-600 text-right">
                        {formatearMoneda(egreso.monto)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {traducirMetodoPago(egreso.metodo_pago)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {egreso.proveedor || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">
                        {formatearFecha(egreso.fecha)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditar(egreso)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(egreso)}
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
      <ModalEgreso
        isOpen={modalOpen}
        onClose={handleCerrarModal}
        onSuccess={handleRegistroExitoso}
        egresoToEdit={egresoToEdit}
      />
    </Layout>
  );
};

export default EgresosPage;
