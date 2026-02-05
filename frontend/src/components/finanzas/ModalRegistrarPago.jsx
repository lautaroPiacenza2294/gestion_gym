import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ModalRegistrarPago = ({ isOpen, onClose, onSuccess }) => {
  // ==================== ESTADO ====================
  const [formData, setFormData] = useState({
    cliente: '',
    membresia: '',
    fecha_pago: new Date().toISOString().split('T')[0], // Hoy por defecto
    monto: '',
    metodo_pago: 'efectivo',
    concepto: 'membresia',
    observaciones: '',
  });

  const [clientes, setClientes] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);

  // ==================== EFECTOS ====================

  // Cargar clientes cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      cargarClientes();
    }
  }, [isOpen]);

  // Cargar membresías cuando se selecciona un cliente
  useEffect(() => {
    if (formData.cliente) {
      cargarMembresias(formData.cliente);
    }
  }, [formData.cliente]);

  // ==================== FUNCIONES ====================

  const cargarClientes = async () => {
    setLoadingClientes(true);
    try {
      // TODO: Reemplazar con tu API real de clientes
      // const response = await clientesAPI.getAll();
      // setClientes(response.data);
      
      // Mock temporal (reemplazar con API real)
      setClientes([
        { id: 1, nombre: 'Juan', apellido: 'Pérez' },
        { id: 2, nombre: 'María', apellido: 'García' },
        { id: 3, nombre: 'Carlos', apellido: 'López' },
      ]);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoadingClientes(false);
    }
  };

  const cargarMembresias = async (clienteId) => {
    try {
      // TODO: Reemplazar con tu API real de membresías
      // const response = await membresiasAPI.getByCliente(clienteId);
      // setMembresias(response.data);
      
      // Mock temporal (reemplazar con API real)
      setMembresias([
        { id: 1, nombre: 'Mensual - Libre' },
        { id: 2, nombre: 'Trimestral - Musculación' },
      ]);
    } catch (error) {
      console.error('Error al cargar membresías:', error);
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
      // TODO: Conectar con tu API real
      // await pagosAPI.create(formData);
      
      console.log('Datos a enviar:', formData);
      
      // Simular envío exitoso
      setTimeout(() => {
        alert('¡Pago registrado exitosamente!');
        onSuccess(); // Recargar lista de pagos
        onClose(); // Cerrar modal
        resetForm();
      }, 1000);
      
    } catch (error) {
      console.error('Error al registrar pago:', error);
      alert('Error al registrar el pago');
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
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // No renderizar nada si el modal está cerrado
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
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente <span className="text-red-500">*</span>
            </label>
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
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* Membresía (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Membresía
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
                  {membresia.nombre}
                </option>
              ))}
            </select>
            {!formData.cliente && (
              <p className="text-xs text-gray-500 mt-1">
                Primero selecciona un cliente
              </p>
            )}
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
              <input
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta_debito">Tarjeta de Débito</option>
                <option value="tarjeta_credito">Tarjeta de Crédito</option>
                <option value="mercadopago">Mercado Pago</option>
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
                <option value="membresia">Membresía</option>
                <option value="inscripcion">Inscripción</option>
                <option value="clase_particular">Clase Particular</option>
                <option value="producto">Venta de Producto</option>
                <option value="otro">Otro</option>
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
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Registrar Pago'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ModalRegistrarPago;