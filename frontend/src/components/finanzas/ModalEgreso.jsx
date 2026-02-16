import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { egresosAPI } from '../../services/finanzas';

const ModalEgreso = ({ isOpen, onClose, onSuccess, egresoToEdit = null }) => {
  const isEditMode = !!egresoToEdit;

  const initialFormData = {
    fecha: new Date().toISOString().split('T')[0],
    categoria: 'mantenimiento',
    descripcion: '',
    monto: '',
    metodo_pago: 'efectivo',
    proveedor: '',
    comprobante: '',
    observaciones: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && egresoToEdit) {
        setFormData({
          fecha: egresoToEdit.fecha || new Date().toISOString().split('T')[0],
          categoria: egresoToEdit.categoria || 'mantenimiento',
          descripcion: egresoToEdit.descripcion || '',
          monto: egresoToEdit.monto || '',
          metodo_pago: egresoToEdit.metodo_pago || 'efectivo',
          proveedor: egresoToEdit.proveedor || '',
          comprobante: egresoToEdit.comprobante || '',
          observaciones: egresoToEdit.observaciones || '',
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [isOpen, egresoToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        await egresosAPI.update(egresoToEdit.id, formData);
      } else {
        await egresosAPI.create(formData);
      }
      onSuccess();
      onClose();
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error al guardar egreso:', error);
      alert('Error al guardar el egreso. Verificá los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">

        {/* Header del Modal */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Editar Egreso' : 'Registrar Nuevo Egreso'}
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

          {/* Fila: Fecha y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="equipamiento">Equipamiento</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="reparaciones">Reparaciones</option>
                <option value="insumos">Insumos de Limpieza</option>
                <option value="marketing">Marketing/Publicidad</option>
                <option value="suplementos">Suplementos/Productos</option>
                <option value="servicios_profesionales">Servicios Profesionales</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripcion <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Ej: Compra de mancuernas, reparación de cinta..."
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Fila: Monto y Método de Pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metodo de Pago <span className="text-red-500">*</span>
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
                <option value="tarjeta_debito">Tarjeta de Debito</option>
                <option value="tarjeta_credito">Tarjeta de Credito</option>
              </select>
            </div>
          </div>

          {/* Fila: Proveedor y Comprobante */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor
              </label>
              <input
                type="text"
                name="proveedor"
                value={formData.proveedor}
                onChange={handleChange}
                placeholder="Nombre del proveedor"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comprobante
              </label>
              <input
                type="text"
                name="comprobante"
                value={formData.comprobante}
                onChange={handleChange}
                placeholder="N° de factura/recibo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
              placeholder="Notas adicionales..."
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
              {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Registrar Egreso')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ModalEgreso;
