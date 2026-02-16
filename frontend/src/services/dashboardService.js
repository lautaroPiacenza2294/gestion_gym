// src/services/dashboardService.js
import api from './axiosConfig';  // ← Cambiar esta línea

/**
 * Servicio para consumir datos del Dashboard
 * Una sola llamada trae todo lo necesario
 */

const dashboardService = {
  /**
   * Obtiene todos los datos del dashboard
   * @returns {Promise} - KPIs, gráfico, alertas y actividad
   */
  getOverview: async () => {
    try {
      const response = await api.get('/dashboard/overview/');
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error);
      throw error;
    }
  }
};

export default dashboardService;