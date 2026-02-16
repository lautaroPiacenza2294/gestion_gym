import React from 'react';

const KPICard = ({ title, value, icon, iconBg, iconColor, change, trend }) => {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {trend === 'up' ? '↑' : '↓'} {change}
            </span>
            <span className="text-xs text-slate-400 font-medium">vs mes anterior</span>
          </div>
        </div>
        <div className={`${iconBg} ${iconColor} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;