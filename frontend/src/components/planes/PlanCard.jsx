// src/components/planes/PlanCard.jsx
import React, { useState } from 'react';
import { Edit2, Calendar, DollarSign, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { planesAPI } from '../../services';

const PlanCard = ({ plan, onEdit, onRefresh }) => {
  const [loading, setLoading] = useState(false);

  // Toggle activo/inactivo
  const handleToggleActivo = async () => {
    try {
      setLoading(true);
      await planesAPI.partialUpdate(plan.id, { activo: !plan.activo });
      onRefresh();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border-2 transition-all hover:shadow-md ${
        plan.activo ? 'border-indigo-100' : 'border-slate-200 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{plan.nombre}</h3>
            <div className="flex items-center space-x-2 mt-2">
              <Calendar className="text-slate-400" size={16} />
              <span className="text-sm font-medium text-slate-600">
                {plan.frecuencia_semanal}x por semana
              </span>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              plan.activo
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {plan.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Precio */}
        <div className="flex items-baseline space-x-1 mt-4">
          <DollarSign className="text-indigo-600" size={24} />
          <span className="text-3xl font-black text-indigo-600">
            {new Intl.NumberFormat('es-AR').format(plan.precio)}
          </span>
          <span className="text-sm text-slate-500 font-medium">/mes</span>
        </div>
      </div>

      {/* Descripción */}
      {plan.descripcion && (
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-sm text-slate-600 line-clamp-2">{plan.descripcion}</p>
        </div>
      )}

      {/* Footer con acciones */}
      <div className="p-4 bg-slate-50 rounded-b-2xl flex justify-between items-center">
        <div className="flex items-center space-x-2 text-slate-600">
          <Users size={16} />
          <span className="text-sm font-medium">{plan.cantidad_membresias ?? 0} miembros</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Botón Editar */}
          <button
            onClick={onEdit}
            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Editar plan"
          >
            <Edit2 size={18} />
          </button>

          {/* Toggle Activo */}
          <button
            onClick={handleToggleActivo}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              plan.activo
                ? 'text-emerald-600 hover:bg-emerald-50'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
            title={plan.activo ? 'Desactivar' : 'Activar'}
          >
            {plan.activo ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;