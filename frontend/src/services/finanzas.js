import { createCrudAPI } from './baseAPI';

// ============================================
// API DE PAGOS
// ============================================

export const pagosAPI = createCrudAPI('/finanzas/pagos');

// ============================================
// API DE GASTOS FIJOS
// ============================================

export const gastosFijosAPI = createCrudAPI('/finanzas/gastos');

// ============================================
// API DE EGRESOS
// ============================================

export const egresosAPI = createCrudAPI('/finanzas/egresos');

// ============================================
// API DE ESTADO DE CUENTA
// ============================================

export const estadoCuentaAPI = createCrudAPI('/finanzas/estado');