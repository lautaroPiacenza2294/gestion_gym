import api from './axiosConfig';
import { createExtendedAPI } from './baseAPI';

// ============================================
// API DE CLIENTES
// ============================================

export const clientesAPI = createExtendedAPI('/clientes/cliente', {
  // Métodos personalizados adicionales
  getActivos: () => api.get('/clientes/cliente/activos/'),
  getCumpleaniosMes: () => api.get('/clientes/cliente/cumpleanos_mes/'),
  activar: (id) => api.post(`/clientes/cliente/${id}/activar/`),
  desactivar: (id) => api.post(`/clientes/cliente/${id}/desactivar/`),
});

// ============================================
// API DE RECORDATORIOS
// ============================================

export const recordatoriosAPI = createExtendedAPI('/clientes/recordatorios', {
  // Métodos personalizados adicionales
  getPendientes: () => api.get('/clientes/recordatorios/pendientes/'),
  getHoy: () => api.get('/clientes/recordatorios/hoy/'),
  enviar: (id) => api.post(`/clientes/recordatorios/${id}/enviar/`),
  cancelar: (id) => api.post(`/clientes/recordatorios/${id}/cancelar/`),
});

// ============================================
// API DE HUELLAS
// ============================================

export const huellasAPI = createExtendedAPI('/clientes/huellas', {
  // Métodos personalizados adicionales
  desactivar: (id) => api.post(`/clientes/huellas/${id}/desactivar/`),
});
