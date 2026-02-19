import { useState, useEffect } from 'react';
import React from 'react';
import Layout from '../../components/layout/Layout';
import KPICard from '../../components/finanzas/KPICard';
import ListaPagos from '../../components/finanzas/ListaPagos';
import ListaEgresos from '../../components/finanzas/ListaEgresos';
import PendientesPago from '../../components/shared/PendientesPago';
import { pagosAPI, egresosAPI } from '../../services/finanzas';
import { useNavigate } from 'react-router-dom';

const FinanzasDashboard = () => {
  // ==================== ESTADO ====================
  const [loading, setLoading] = useState(true);
  const [loadingPagos, setLoadingPagos] = useState(true);
  const [loadingEgresos, setLoadingEgresos] = useState(true);
  const navigate = useNavigate();
  
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);
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
      const resIngresos = await pagosAPI.getTotalMes();
      const ingresos = resIngresos.data.total || 0;
      setTotalIngresos(ingresos);

      const resEgresos = await egresosAPI.getTotalMes();
      const egresos = resEgresos.data.total || 0;
      setTotalEgresos(egresos);

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

  const handleRegistrarPago = () => {
    navigate('/finanzas/pagos'); 
  };

  // ==================== RENDER ====================
  
  return (
    <Layout title="Dashboard de Finanzas">
      {/* 👇 WRAPPER CON CLASE ÚNICA PARA RESETEAR ESTILOS */}
      <div className="finanzas-module">
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
          
          {/* Header con botón de acción */}
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 mt-1">
                Resumen del mes actual
              </p>
            </div>
            
            <button
              onClick={handleRegistrarPago}
              className="
                bg-blue-600 hover:bg-blue-700
                text-white font-medium
                px-4 py-2 rounded-lg
                transition-colors duration-200
                flex items-center gap-2
              "
            >
              <span className="text-lg"></span>
              Ver Pagos
            </button>
          </div>

          {/* KPIs - 3 tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              title="Balance del Mes"
              value={balance}
              icon="💵"
              color={balance >= 0 ? 'green' : 'red'}
              loading={loading}
            />
          </div>

          {/* Pagos pendientes */}
          <PendientesPago />

          {/* Listas - 2 columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ListaPagos
              pagos={ultimosPagos}
              loading={loadingPagos}
            />

            <ListaEgresos
              egresos={ultimosEgresos}
              loading={loadingEgresos}
            />
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default FinanzasDashboard;