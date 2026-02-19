import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { gastosFijosAPI } from '../../services/finanzas';

const ModalGastoFijo = ({ isOpen, onClose, onSuccess, gastoToEdit = null }) => {
  const isEditMode = !!gastoToEdit;

  const initialFormData = {
    nombre: '',
    categoria: 'servicios',
    monto_mensual: '',
    dia_vencimiento: '',
    activo: true,
    observaciones: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && gastoToEdit) {
        setFormData({
          nombre: gastoToEdit.nombre || '',
          categoria: gastoToEdit.categoria || 'servicios',
          monto_mensual: gastoToEdit.monto_mensual || '',
          dia_vencimiento: gastoToEdit.dia_vencimiento || '',
          activo: gastoToEdit.activo !== undefined ? gastoToEdit.activo : true,
          observaciones: gastoToEdit.observaciones || '',
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [isOpen, gastoToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        await gastosFijosAPI.update(gastoToEdit.id, formData);
      } else {
        await gastosFijosAPI.create(formData);
      }
      onSuccess();
      onClose();
      setFormData(initialFormData);
    } catch (error) {
      console.error('Error al guardar gasto fijo:', error);
      alert('Error al guardar el gasto fijo. Verifica los datos.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">

        {/* Header del Modal */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditMode ? 'Editar Gasto Fijo' : 'Agregar Gasto Fijo'}
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

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Alquiler del local, Servicio de luz..."
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Fila: Categoria y Monto Mensual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="alquiler">Alquiler</option>
                <option value="servicios">Servicios (luz, agua, gas)</option>
                <option value="internet">Internet/Telefono</option>
                <option value="salarios">Salarios</option>
                <option value="impuestos">Impuestos</option>
                <option value="seguro">Seguros</option>
                <option value="limpieza">Limpieza</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto Mensual <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="monto_mensual"
                value={formData.monto_mensual}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Fila: Dia Vencimiento y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dia de Vencimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="dia_vencimiento"
                value={formData.dia_vencimiento}
                onChange={handleChange}
                placeholder="1-31"
                min="1"
                max="31"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Dia del mes en que vence este gasto
              </p>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Gasto activo
                </span>
              </label>
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
              {loading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Agregar Gasto Fijo')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ModalGastoFijo;
