import { createCrudAPI } from './baseAPI';
import api from './axiosConfig';

// ============================================
// API DE EJERCICIOS
// ============================================

export const ejerciciosAPI = createCrudAPI('/membresias/ejercicio');

// ============================================
// API DE PLANES
// ============================================

export const planesAPI = createCrudAPI('/membresias/planes');

// ============================================
// API DE MEMBRESÍAS
// ============================================

export const membresiasAPI = {
  ...createCrudAPI('/membresias/membresia'),
  getByCliente: (clienteId) => api.get(`/membresias/membresia/?cliente=${clienteId}`),
  getSinPago: () => api.get('/membresias/membresia/sin_pago/'),
};

// ============================================
// API DE RUTINAS
// ============================================

export const rutinasAPI = createCrudAPI('/membresias/rutinas');

// ============================================
// API DE SEMANAS
// ============================================

export const semanasAPI = createCrudAPI('/membresias/semanas');

// ============================================
// API DE DÍAS DE ENTRENAMIENTO
// ============================================

export const diasEntrenamientoAPI = createCrudAPI('/membresias/dias');