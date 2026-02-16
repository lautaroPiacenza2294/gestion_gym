// src/hooks/useDashboard.js
import { useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';

/**
 * Hook personalizado para manejar datos del Dashboard
 * Maneja: loading, error, datos, y refresh
 */

export const useDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    kpis: null,
    chartData: null,
    alertas: null,
    actividad: null
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Una sola llamada al backend
      const response = await dashboardService.getOverview();

      setData({
        kpis: response.kpis,
        chartData: response.chart_data,
        alertas: response.alertas,
        actividad: response.actividad
      });
    } catch (err) {
      setError(err.message || 'Error al cargar el dashboard');
      console.error('Error en useDashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    kpis: data.kpis,
    chartData: data.chartData,
    alertas: data.alertas,
    actividad: data.actividad,
    loading,
    error,
    refresh: fetchDashboardData
  };
};