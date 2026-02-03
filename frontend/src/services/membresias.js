import { createCrudAPI } from './baseAPI';

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

export const membresiasAPI = createCrudAPI('/membresias/membresia');

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