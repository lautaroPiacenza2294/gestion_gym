import { clientesAPI } from './clientes';
import { membresiasAPI } from './membresias';
import { pagosAPI, gastosFijosAPI } from './finanzas';
import { recordatoriosAPI } from './clientes';

// ============================================
// API DEL DASHBOARD (KPIs y estadísticas)
// ============================================

export const dashboardAPI = {
  /**
   * Obtener KPIs principales del dashboard
   * Combina datos de clientes, membresías, pagos y gastos
   */
  getKPIs: async () => {
    try {
      const [clientes, membresias, pagos, gastos] = await Promise.all([
        clientesAPI.getAll(),
        membresiasAPI.getAll(),
        pagosAPI.getAll(),
        gastosFijosAPI.getAll(),
      ]);
      
      return {
        clientesActivos: clientes.data.filter(c => c.activo).length,
        membresiasActivas: membresias.data.filter(m => m.estado === 'activa').length,
        ingresosMes: pagos.data.reduce((sum, p) => sum + parseFloat(p.monto), 0),
        clientesMorosos: 0, // Aquí puedes calcular según tu lógica
      };
    } catch (error) {
      console.error('Error obteniendo KPIs:', error);
      throw error;
    }
  },
  
  /**
   * Obtener actividad reciente del gimnasio
   * Muestra los últimos pagos, membresías y clientes registrados
   */
  getActividadReciente: async () => {
    try {
      const pagos = await pagosAPI.getAll();
      const membresias = await membresiasAPI.getAll();
      const clientes = await clientesAPI.getAll();
      
      // Combinar y ordenar por fecha (tomar los más recientes)
      const actividades = [
        ...pagos.data.slice(0, 5),
        ...membresias.data.slice(0, 5),
        ...clientes.data.slice(0, 5),
      ];
      
      return actividades;
    } catch (error) {
      console.error('Error obteniendo actividad reciente:', error);
      throw error;
    }
  },
  
  /**
   * Obtener alertas importantes
   * Muestra membresías por vencer, recordatorios pendientes, etc.
   */
  getAlertas: async () => {
    try {
      const membresias = await membresiasAPI.getAll();
      const recordatorios = await recordatoriosAPI.getPendientes();
      const gastos = await gastosFijosAPI.getAll();
      
      return {
        membresiasVencer: membresias.data.filter(m => {
          // Lógica para membresías que vencen pronto
          return true; // Implementar según tu lógica
        }).length,
        recordatoriosPendientes: recordatorios.data.length,
        gastosProximos: gastos.data.filter(g => g.activo).length,
      };
    } catch (error) {
      console.error('Error obteniendo alertas:', error);
      throw error;
    }
  },
};