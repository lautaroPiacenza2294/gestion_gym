// src/components/planes/PlanModal.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Loader } from 'lucide-react';
import { planesAPI } from '../../services';

const PlanModal = ({ plan, onClose, onSuccess }) => {
  const isEditing = !!plan;

  const [formData, setFormData] = useState({
    nombre: plan?.nombre || '',
    frecuencia_semanal: plan?.frecuencia_semanal || 2,
    precio: plan?.precio || '',
    descripcion: plan?.descripcion || '',
    activo: plan?.activo ?? true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validar formulario
  const validate = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      newErrors.precio = 'El precio debe ser mayor a 0';
    }

    if (![2, 3, 5].includes(parseInt(formData.frecuencia_semanal))) {
      newErrors.frecuencia_semanal = 'La frecuencia debe ser 2, 3 o 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const dataToSend = {
        ...formData,
        precio: parseFloat(formData.precio),
        frecuencia_semanal: parseInt(formData.frecuencia_semanal)
      };

      if (isEditing) {
        await planesAPI.update(plan.id, dataToSend);
      } else {
        await planesAPI.create(dataToSend);
      }

      setLoading(false);
      onSuccess();
    } catch (error) {
      setLoading(false);
      console.error('Error al guardar:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        alert('Error al guardar el plan');
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">
            {isEditing ? 'Editar Plan' : 'Nuevo Plan'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nombre del Plan *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Plan Premium"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.nombre ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.nombre && (
              <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>
            )}
          </div>

          {/* Frecuencia Semanal */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Frecuencia Semanal *
            </label>
            <select
              name="frecuencia_semanal"
              value={formData.frecuencia_semanal}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.frecuencia_semanal ? 'border-red-500' : 'border-slate-300'
              }`}
            >
              <option value={2}>2 veces por semana</option>
              <option value={3}>3 veces por semana</option>
              <option value={5}>5 veces por semana</option>
            </select>
            {errors.frecuencia_semanal && (
              <p className="text-red-600 text-xs mt-1">{errors.frecuencia_semanal}</p>
            )}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Precio Mensual *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                $
              </span>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                placeholder="15000"
                step="0.01"
                className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.precio ? 'border-red-500' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.precio && (
              <p className="text-red-600 text-xs mt-1">{errors.precio}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Descripción del plan..."
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Activo */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <label className="text-sm font-medium text-slate-700">
              Plan activo
            </label>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{isEditing ? 'Actualizar' : 'Crear'} Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default PlanModal;