// src/pages/Dashboard.jsx
import React from 'react';
import { Users, CreditCard, UserPlus, AlertTriangle, AlertCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import KPICard from '../components/dashboard/KPICard';
import GraficoSociosPorPlan from '../components/dashboard/GraficoSociosPorPlan';
import AlertasPanel from '../components/dashboard/AlertasPanel';
import ActividadReciente from '../components/dashboard/ActividadReciente';
import PendientesPago from '../components/shared/PendientesPago';
import CumpleaniosMes from '../components/shared/CumpleaniosMes';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard = () => {
  const { kpis, chartData, alertas, actividad, loading, error } = useDashboard();

  // Estado de carga
  if (loading) {
    return (
      <Layout title="Dashboard General">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 font-medium">Cargando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Estado de error
  if (error) {
    return (
      <Layout title="Dashboard General">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="text-red-800 font-bold">Error al cargar el dashboard</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Mapeo de KPIs a formato del componente
  const kpisArray = [
    {
      title: 'Clientes Activos',
      value: kpis?.clientes_activos?.value || '0',
      icon: <Users size={24} />,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      change: kpis?.clientes_activos?.change || '0%',
      trend: kpis?.clientes_activos?.trend || 'up'
    },
    {
      title: 'Membresías Activas',
      value: kpis?.membresias_activas?.value || '0',
      icon: <CreditCard size={24} />,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      change: kpis?.membresias_activas?.change || '0%',
      trend: kpis?.membresias_activas?.trend || 'up'
    },
    {
      title: 'Vencen esta semana',
      value: kpis?.membresias_por_vencer?.value || '0',
      icon: <AlertTriangle size={24} />,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      change: kpis?.membresias_por_vencer?.change || 'próx. 7 días',
      trend: kpis?.membresias_por_vencer?.trend || 'down'
    },
    {
      title: 'Nuevos este mes',
      value: kpis?.nuevos_socios_mes?.value || '0',
      icon: <UserPlus size={24} />,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      change: kpis?.nuevos_socios_mes?.change || '0%',
      trend: kpis?.nuevos_socios_mes?.trend || 'up'
    }
  ];

  return (
    <Layout title="Dashboard General">
      <div className="space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpisArray.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        {/* Gráfico y Alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <GraficoSociosPorPlan data={chartData || []} />
          </div>
          <div className="lg:col-span-1">
            <AlertasPanel alertas={alertas || []} />
          </div>
        </div>

        {/* Pagos pendientes y cumpleaños del mes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PendientesPago />
          <CumpleaniosMes />
        </div>

        {/* Actividad */}
        <ActividadReciente actividades={actividad || []} />
      </div>
    </Layout>
  );
};

export default Dashboard;