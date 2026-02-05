import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { pagosAPI } from '../../services/finanzas';
import { clientesAPI } from '../../services/clientes';
import { membresiasAPI } from '../../services/membresias';

const ModalRegistrarPago = ({ isOpen, onClose, onSuccess }) => {
  // ==================== ESTADO ====================
  const [formData, setFormData] = useState({
    cliente: '',
    membresia: '',
    fecha_pago: new Date().toISOString().split('T')[0],
    monto: '',
    metodo_pago: 'efectivo',
    concepto: 'membresia',
    observaciones: '',
  });

  const [clientes, setClientes] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [clientesFiltrados, setClientesFiltrados] = useState([]);

  // ==================== EFECTOS ====================

  useEffect(() => {
    if (isOpen) {
      cargarClientes();
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.cliente) {
      cargarMembresias(formData.cliente);
    } else {
      setMembresias([]);
    }
  }, [formData.cliente]);

  // Filtrar clientes según búsqueda
  useEffect(() => {
    if (busquedaCliente.trim() === '') {
      setClientesFiltrados(clientes);
    } else {
      const filtrados = clientes.filter(cliente => {
        const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`.toLowerCase();
        const dni = cliente.dni ? cliente.dni.toString() : '';
        const busqueda = busquedaCliente.toLowerCase();
        return nombreCompleto.includes(busqueda) || dni.includes(busqueda);
      });
      setClientesFiltrados(filtrados);
    }
  }, [busquedaCliente, clientes]);

  // ==================== FUNCIONES ====================

  const cargarClientes = async () => {
    setLoadingClientes(true);
    try {
      const response = await clientesAPI.getActivos(); // Solo clientes activos
      setClientes(response.data);
      setClientesFiltrados(response.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      alert('Error al cargar la lista de clientes');
    } finally {
      setLoadingClientes(false);
    }
  };

  const cargarMembresias = async (clienteId) => {
    try {
      const response = await membresiasAPI.getAll({ cliente: clienteId });
      // Filtrar solo membresías activas
      const membresiasActivas = response.data.filter(m => m.estado === 'activa');
      setMembresias(membresiasActivas);
    } catch (error) {
      console.error('Error al cargar membresías:', error);
      setMembresias([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar datos para enviar según el serializer
      const dataToSend = {
        cliente: parseInt(formData.cliente),
        fecha_pago: formData.fecha_pago,
        monto: parseFloat(formData.monto),
        metodo_pago: formData.metodo_pago,
        concepto: formData.concepto,
        observaciones: formData.observaciones || '',
      };

      // Solo agregar membresía si se seleccionó una
      if (formData.membresia) {
        dataToSend.membresia = parseInt(formData.membresia);
      }

      console.log('📤 Enviando datos:', dataToSend);

      // Enviar al backend
      const response = await pagosAPI.create(dataToSend);
      
      console.log('✅ Respuesta del servidor:', response.data);
      
      alert('¡Pago registrado exitosamente!');
      onSuccess(); // Recargar lista de pagos
      handleClose(); // Cerrar modal
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('📋 Respuesta del servidor:', error.response?.data);
      
      let errorMessage = 'Error al registrar el pago';
      
      if (error.response?.data) {
        // Mostrar errores específicos del backend
        const errores = error.response.data;
        const mensajes = Object.entries(errores)
          .map(([campo, mensaje]) => `${campo}: ${Array.isArray(mensaje) ? mensaje.join(', ') : mensaje}`)
          .join('\n');
        errorMessage = `Errores:\n${mensajes}`;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      cliente: '',
      membresia: '',
      fecha_pago: new Date().toISOString().split('T')[0],
      monto: '',
      metodo_pago: 'efectivo',
      concepto: 'membresia',
      observaciones: '',
    });
    setBusquedaCliente('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  // ==================== RENDER ====================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        
        {/* Header del Modal */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Registrar Nuevo Pago
          </h2>
          <button
            onClick={handleClose}
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Búsqueda de Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Cliente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={busquedaCliente}
              onChange={(e) => setBusquedaCliente(e.target.value)}
              placeholder="Escribe nombre, apellido o DNI..."
              disabled={loadingClientes}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
            />
            
            {/* Select de Cliente */}
            <select
              name="cliente"
              value={formData.cliente}
              onChange={handleChange}
              required
              disabled={loadingClientes}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                {loadingClientes ? 'Cargando clientes...' : 'Seleccionar cliente'}
              </option>
              {clientesFiltrados.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellido} {cliente.dni ? `- DNI: ${cliente.dni}` : ''}
                </option>
              ))}
            </select>
            
            {busquedaCliente && clientesFiltrados.length === 0 && (
              <p className="text-sm text-amber-600 mt-1">
                ⚠️ No se encontraron clientes con "{busquedaCliente}"
              </p>
            )}
            
            {!loadingClientes && clientes.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                ⚠️ No hay clientes activos. Crea un cliente primero.
              </p>
            )}
          </div>

          {/* Membresía (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Membresía (opcional)
            </label>
            <select
              name="membresia"
              value={formData.membresia}
              onChange={handleChange}
              disabled={!formData.cliente}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Sin membresía asociada</option>
              {membresias.map(membresia => (
                <option key={membresia.id} value={membresia.id}>
                  {membresia.tipo_membresia_nombre || membresia.tipo_membresia} - {membresia.estado}
                </option>
              ))}
            </select>
            {!formData.cliente ? (
              <p className="text-xs text-gray-500 mt-1">
                Primero selecciona un cliente
              </p>
            ) : membresias.length === 0 ? (
              <p className="text-xs text-gray-500 mt-1">
                Este cliente no tiene membresías activas
              </p>
            ) : null}
          </div>

          {/* Fila: Fecha y Monto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Pago <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha_pago"
                value={formData.fecha_pago}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  required
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Fila: Método de Pago y Concepto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método de Pago <span className="text-red-500">*</span>
              </label>
              <select
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="efectivo">💵 Efectivo</option>
                <option value="transferencia">🏦 Transferencia</option>
                <option value="tarjeta_debito">💳 Tarjeta de Débito</option>
                <option value="tarjeta_credito">💳 Tarjeta de Crédito</option>
                <option value="mercadopago">💰 Mercado Pago</option>
              </select>
            </div>

            {/* Concepto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Concepto <span className="text-red-500">*</span>
              </label>
              <select
                name="concepto"
                value={formData.concepto}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="membresia">🎫 Membresía</option>
                <option value="inscripcion">📝 Inscripción</option>
                <option value="clase_particular">👤 Clase Particular</option>
                <option value="producto">🛍️ Venta de Producto</option>
                <option value="otro">📌 Otro</option>
              </select>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows="3"
              placeholder="Notas adicionales sobre el pago..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || clientes.length === 0}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? 'Guardando...' : 'Registrar Pago'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ModalRegistrarPago;