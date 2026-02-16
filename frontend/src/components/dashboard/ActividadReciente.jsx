// src/components/dashboard/ActividadReciente.jsx
import React from 'react';
import { Clock, DollarSign, UserPlus, RefreshCw } from 'lucide-react';

const ActividadReciente = ({ actividades = [] }) => {
  const getIcon = (tipo) => {
    switch(tipo) {
      case 'pago':
        return <DollarSign size={16} className="text-white" />;
      case 'cliente_nuevo':
        return <UserPlus size={16} className="text-white" />;
      case 'renovacion':
        return <RefreshCw size={16} className="text-white" />;
      default:
        return <Clock size={16} className="text-white" />;
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Clock className="text-slate-400" size={20} />
          <h3 className="text-lg font-bold text-slate-800">Actividad Reciente</h3>
        </div>
        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
          Ver todo
        </button>
      </div>

      <div className="space-y-8 relative">
        {/* Línea vertical decorativa */}
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-50"></div>

        {actividades.map((act, index) => (
          <div key={index} className="flex items-start space-x-6 relative z-10 group">
            <div className={`${act.color} p-2 rounded-xl shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>
              {getIcon(act.tipo)}
            </div>
            <div className="flex-1 flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {act.titulo}
                </h4>
                <p className="text-xs text-slate-500 font-medium">{act.desc}</p>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
                {act.hora}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActividadReciente;