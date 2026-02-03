/**
 * ============================================
 * ÍNDICE CENTRAL DE APIS
 * ============================================
 * 
 * Este archivo centraliza todas las exportaciones de las APIs.
 * Permite importar desde un solo lugar:
 * 
 * import { clientesAPI, membresiasAPI } from './services/api';
 */

// Exportar APIs de clientes
export { 
  clientesAPI, 
  recordatoriosAPI, 
  huellasAPI 
} from './clientes';

// Exportar APIs de membresías
export { 
  ejerciciosAPI, 
  planesAPI, 
  membresiasAPI, 
  rutinasAPI, 
  semanasAPI, 
  diasEntrenamientoAPI 
} from './membresias';

// Exportar APIs de finanzas
export { 
  pagosAPI, 
  gastosFijosAPI, 
  egresosAPI, 
  estadoCuentaAPI 
} from './finanzas';

// Exportar API del dashboard
export { dashboardAPI } from './dashboard';

// Exportar configuración de axios (por si se necesita directamente)
export { default as api } from './axiosConfig';

// Exportar funciones base (por si quieres crear nuevas APIs)
export { createCrudAPI, createExtendedAPI } from './baseAPI';