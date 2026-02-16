// src/components/dashboard/AlertasPanel.jsx
import React from 'react';
import { Bell } from 'lucide-react';

const AlertasPanel = ({ alertas = [] }) => {
  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-full">
      <div className="flex items-center space-x-3 mb-8">
        <Bell className="text-slate-400" size={20} />
        <h3 className="text-lg font-bold text-slate-800">Alertas</h3>
      </div>

      <div className="space-y-4">
        {alertas.map((alerta, index) => (
          <div 
            key={index} 
            className={`${alerta.bg} ${alerta.border} border p-4 rounded-2xl flex items-center space-x-4`}
          >
            <span className={`text-2xl font-black ${alerta.text}`}>{alerta.cantidad}</span>
            <div>
              <p className={`font-bold text-sm ${alerta.text}`}>{alerta.titulo}</p>
              <p className="text-xs text-slate-500 font-medium">{alerta.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertasPanel;