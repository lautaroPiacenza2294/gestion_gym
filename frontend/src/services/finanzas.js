import { createCrudAPI } from './baseAPI';
import api from './axiosConfig';

// ============================================
// API DE PAGOS
// ============================================

export const pagosAPI = {
  ...createCrudAPI('/finanzas/pagos'),
  
  // Métodos personalizados del ViewSet
  getPagosHoy: () => api.get('/finanzas/pagos/hoy/'),
  getPagosMesActual: () => api.get('/finanzas/pagos/mes_actual/'),
  getTotalMes: () => api.get('/finanzas/pagos/total_mes/'),
};

// ============================================
// API DE GASTOS FIJOS
// ============================================

export const gastosFijosAPI = {
  ...createCrudAPI('/finanzas/gastos'),
  
  // Métodos personalizados del ViewSet
  getActivos: () => api.get('/finanzas/gastos/activos/'),
  getTotalMensual: () => api.get('/finanzas/gastos/total_mensual/'),
  getProximosVencimientos: () => api.get('/finanzas/gastos/proximos_vencimientos/'),
};

// ============================================
// API DE EGRESOS
// ============================================

export const egresosAPI = {
  ...createCrudAPI('/finanzas/egresos'),
  
  // Métodos personalizados del ViewSet
  getMesActual: () => api.get('/finanzas/egresos/mes_actual/'),
  getTotalMes: () => api.get('/finanzas/egresos/total_mes/'),
};

// ============================================
// API DE ESTADO DE CUENTA
// ============================================

export const estadoCuentaAPI = {
  ...createCrudAPI('/finanzas/estado'),
  
  // Métodos personalizados del ViewSet
  getMorosos: () => api.get('/finanzas/estado/morosos/'),
  getAlDia: () => api.get('/finanzas/estado/al_dia/'),
  getSuspendidos: () => api.get('/finanzas/estado/suspendidos/'),
  getProximosVencimientos: () => api.get('/finanzas/estado/proximos_vencimientos/'),
};