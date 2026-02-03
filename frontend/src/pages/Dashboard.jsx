import { Users, CreditCard, DollarSign, AlertCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import KPICard from '../components/dashboard/KPICard';
import ChartCard from '../components/dashboard/ChartCard';
import AlertasPanel from '../components/dashboard/AlertasPanel';
import ActividadReciente from '../components/dashboard/ActividadReciente';
import '../components/dashboard/dashboard.css'

const Dashboard = () => {
  // ============================================
  // DATOS DE EJEMPLO PARA LOS KPIs
  // ============================================
  const kpis = [
    {
      title: 'Clientes Activos',
      value: '120',
      icon: <Users size={28} />,
      iconBg: '#3b82f6',
      change: '8%',
      changeText: 'vs mes anterior',
      trend: 'up'
    },
    {
      title: 'Membresías Activas',
      value: '85',
      icon: <CreditCard size={28} />,
      iconBg: '#22c55e',
      change: '5%',
      changeText: 'vs mes anterior',
      trend: 'up'
    },
    {
      title: 'Ingresos del Mes',
      value: '$450K',
      icon: <DollarSign size={28} />,
      iconBg: '#f59e0b',
      change: '12%',
      changeText: 'vs mes anterior',
      trend: 'up'
    },
    {
      title: 'Clientes Morosos',
      value: '12',
      icon: <AlertCircle size={28} />,
      iconBg: '#ef4444',
      change: '3',
      changeText: 'desde ayer',
      trend: 'down'
    }
  ];

  // ============================================
  // DATOS DE EJEMPLO PARA EL GRÁFICO
  // ============================================
  const chartData = [
    { dia: '1', ingresos: 45000, egresos: 28000 },
    { dia: '5', ingresos: 52000, egresos: 32000 },
    { dia: '10', ingresos: 48000, egresos: 35000 },
    { dia: '15', ingresos: 61000, egresos: 31000 },
    { dia: '20', ingresos: 58000, egresos: 29000 },
    { dia: '25', ingresos: 70000, egresos: 38000 },
    { dia: '30', ingresos: 75000, egresos: 33000 },
  ];

  // ============================================
  // DATOS DE EJEMPLO PARA ALERTAS
  // ============================================
  const alertas = [
    {
      cantidad: '8',
      titulo: 'Membresías por vencer',
      descripcion: 'Vencen en los próximos 7 días',
      tipo: 'danger'
    },
    {
      cantidad: '5',
      titulo: 'Recordatorios pendientes',
      descripcion: 'Programados para hoy',
      tipo: 'warning'
    },
    {
      cantidad: '3',
      titulo: 'Gastos fijos próximos',
      descripcion: 'Vencen esta semana',
      tipo: 'success'
    }
  ];

  // ============================================
  // DATOS DE EJEMPLO PARA ACTIVIDAD RECIENTE
  // ============================================
  const actividades = [
    {
      tipo: 'pago',
      titulo: 'Juan Pérez realizó un pago',
      descripcion: 'Pago de membresía mensual - $15,000',
      hora: 'Hoy 10:30'
    },
    {
      tipo: 'membresia_nueva',
      titulo: 'Nueva membresía creada',
      descripcion: 'Programados para hoy',
      hora: 'Hoy 10:30'
    },
    {
      tipo: 'membresia_nueva',
      titulo: 'Nueva membresía creada',
      descripcion: 'Ana García - Plan 3x semana',
      hora: 'Hoy 09:15'
    },
    {
      tipo: 'renovacion',
      titulo: 'Renovación de membresía',
      descripcion: 'Carlos López - Plan 5x semana',
      hora: 'Ayer 16:45'
    },
    {
      tipo: 'cliente_nuevo',
      titulo: 'Nuevo cliente registrado',
      descripcion: 'María Rodríguez - DNI 38280942',
      hora: 'Ayer 16:45'
    },
    {
      tipo: 'pago',
      titulo: 'Laura Martínez realizó un pago',
      descripcion: 'Pago de membresía trimestral - $42,000',
      hora: 'Ayer 14:20'
    }
  ];

  return (
    <Layout title="Dashboard">
      <div className="dashboard-container">
        {/* Fila 1: KPI Cards */}
        <div className="kpi-grid">
          {kpis.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        {/* Fila 2: Gráfico + Alertas */}
        <div className="dashboard-middle">
          <ChartCard 
            data={chartData} 
            title="Ingresos vs Egresos (Último mes)" 
          />
          <AlertasPanel alertas={alertas} />
        </div>

        {/* Fila 3: Actividad Reciente */}
        <ActividadReciente actividades={actividades} />
      </div>
    </Layout>
  );
};

export default Dashboard;