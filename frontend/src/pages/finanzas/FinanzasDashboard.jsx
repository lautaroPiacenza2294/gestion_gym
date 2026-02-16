import { useState, useEffect } from 'react';
import React from 'react';
import Layout from '../../components/layout/Layout';
import KPICard from '../../components/finanzas/KPICard';
import ListaPagos from '../../components/finanzas/ListaPagos';
import ListaEgresos from '../../components/finanzas/ListaEgresos';
import { pagosAPI, egresosAPI, gastosFijosAPI } from '../../services/finanzas';
import { useNavigate } from 'react-router-dom';

const FinanzasDashboard = () => {
  // ==================== ESTADO ====================
  const [loading, setLoading] = useState(true);
  const [loadingPagos, setLoadingPagos] = useState(true);
  const [loadingEgresos, setLoadingEgresos] = useState(true);
  const navigate = useNavigate();
  
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [totalGastosFijos, setTotalGastosFijos] = useState(0);
  const [balance, setBalance] = useState(0);

  const [ultimosPagos, setUltimosPagos] = useState([]);
  const [ultimosEgresos, setUltimosEgresos] = useState([]);

  // ==================== EFECTOS ====================
  
  useEffect(() => {
    cargarDatos();
  }, []);

  // ==================== FUNCIONES ====================
  
  const cargarDatos = async () => {
    await Promise.all([
      cargarTotales(),
      cargarUltimosPagos(),
      cargarUltimosEgresos(),
    ]);
  };

  const cargarTotales = async () => {
    setLoading(true);
    try {
      const [resIngresos, resEgresos, resGastosFijos] = await Promise.all([
        pagosAPI.getTotalMes(),
        egresosAPI.getTotalMes(),
        gastosFijosAPI.getTotalMensual(),
      ]);

      const ingresos = resIngresos.data.total || 0;
      const egresos = resEgresos.data.total || 0;
      const gastosFijos = resGastosFijos.data.total || 0;

      setTotalIngresos(ingresos);
      setTotalEgresos(egresos);
      setTotalGastosFijos(gastosFijos);
      setBalance(ingresos - egresos);

    } catch (error) {
      console.error('Error al cargar totales:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarUltimosPagos = async () => {
    setLoadingPagos(true);
    try {
      const response = await pagosAPI.getPagosMesActual();
      const pagos = response.data.slice(0, 5);
      setUltimosPagos(pagos);
    } catch (error) {
      console.error('Error al cargar pagos:', error);
      setUltimosPagos([]);
    } finally {
      setLoadingPagos(false);
    }
  };

  const cargarUltimosEgresos = async () => {
    setLoadingEgresos(true);
    try {
      const response = await egresosAPI.getMesActual();
      const egresos = response.data.slice(0, 5);
      setUltimosEgresos(egresos);
    } catch (error) {
      console.error('Error al cargar egresos:', error);
      setUltimosEgresos([]);
    } finally {
      setLoadingEgresos(false);
    }
  };

  // ==================== RENDER ====================
  
  return (
    <Layout title="Dashboard de Finanzas">
      {/* 👇 WRAPPER CON CLASE ÚNICA PARA RESETEAR ESTILOS */}
      <div className="finanzas-module">
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
          
          {/* Header con botones de acción */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 mt-1">
                Resumen del mes actual
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/finanzas/pagos')}
                className="
                  bg-blue-600 hover:bg-blue-700
                  text-white font-medium
                  px-4 py-2 rounded-lg
                  transition-colors duration-200
                  flex items-center gap-2
                "
              >
                <span className="text-lg">+</span>
                Pagos
              </button>

              <button
                onClick={() => navigate('/finanzas/egresos')}
                className="
                  bg-red-500 hover:bg-red-600
                  text-white font-medium
                  px-4 py-2 rounded-lg
                  transition-colors duration-200
                  flex items-center gap-2
                "
              >
                <span className="text-lg">+</span>
                Egresos
              </button>

              <button
                onClick={() => navigate('/finanzas/gastos-fijos')}
                className="
                  bg-orange-500 hover:bg-orange-600
                  text-white font-medium
                  px-4 py-2 rounded-lg
                  transition-colors duration-200
                "
              >
                Gastos Fijos
              </button>
            </div>
          </div>

          {/* KPIs - 4 tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Ingresos del Mes"
              value={totalIngresos}
              icon="💰"
              color="green"
              loading={loading}
            />

            <KPICard
              title="Egresos del Mes"
              value={totalEgresos}
              icon="📤"
              color="red"
              loading={loading}
            />

            <KPICard
              title="Gastos Fijos / Mes"
              value={totalGastosFijos}
              icon="📋"
              color="orange"
              loading={loading}
            />

            <KPICard
              title="Balance del Mes"
              value={balance}
              icon="💵"
              color={balance >= 0 ? 'green' : 'red'}
              loading={loading}
            />
          </div>

          {/* Listas - 2 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ListaPagos
                pagos={ultimosPagos}
                loading={loadingPagos}
              />
              <button
                onClick={() => navigate('/finanzas/pagos')}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium w-full text-center py-2"
              >
                Ver todos los pagos →
              </button>
            </div>

            <div>
              <ListaEgresos
                egresos={ultimosEgresos}
                loading={loadingEgresos}
              />
              <button
                onClick={() => navigate('/finanzas/egresos')}
                className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium w-full text-center py-2"
              >
                Ver todos los egresos →
              </button>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default FinanzasDashboard;