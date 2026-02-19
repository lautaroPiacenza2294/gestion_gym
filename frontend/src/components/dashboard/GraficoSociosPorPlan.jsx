import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Users } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#14b8a6'];

const TooltipPersonalizado = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl shadow-lg px-4 py-3">
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-sm text-indigo-600 font-semibold mt-0.5">
          {payload[0].value} {payload[0].value === 1 ? 'socio' : 'socios'}
        </p>
      </div>
    );
  }
  return null;
};

const GraficoSociosPorPlan = ({ data = [] }) => {
  const totalSocios = data.reduce((acc, d) => acc + (d.total || 0), 0);

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Socios por Plan</h3>
            <p className="text-xs text-slate-400 font-medium">Membresías activas</p>
          </div>
        </div>
        <span className="text-2xl font-black text-slate-700">{totalSocios}</span>
      </div>

      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-slate-400 text-sm">
          Sin datos de planes activos
        </div>
      ) : (
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="nombre"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip content={<TooltipPersonalizado />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="total" radius={[10, 10, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Leyenda debajo */}
      {data.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-3">
          {data.map((entry, index) => (
            <div key={entry.nombre} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-slate-500 font-medium">{entry.nombre}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GraficoSociosPorPlan;
