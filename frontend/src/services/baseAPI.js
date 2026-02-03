import api from './axiosConfig';

/**
 * ============================================
 * FUNCIONES BASE CRUD GENÉRICAS
 * ============================================
 * 
 * Este archivo contiene funciones reutilizables para crear APIs
 * con operaciones CRUD estándar.
 * 
 * Esto evita repetir el mismo código en cada archivo de API.
 */

/**
 * Crea un objeto con las operaciones CRUD básicas para un endpoint
 * 
 * @param {string} endpoint - El endpoint de la API (ej: '/clientes/cliente')
 * @returns {object} Objeto con métodos CRUD (getAll, getById, create, update, etc.)
 * 
 * Ejemplo de uso:
 * const clientesAPI = createCrudAPI('/clientes/cliente');
 * clientesAPI.getAll(); // GET /clientes/cliente/
 * clientesAPI.getById(1); // GET /clientes/cliente/1/
 */
export const createCrudAPI = (endpoint) => {
  return {
    // Listar todos los registros
    getAll: () => api.get(`${endpoint}/`),
    
    // Obtener un registro por ID
    getById: (id) => api.get(`${endpoint}/${id}/`),
    
    // Crear un nuevo registro
    create: (data) => api.post(`${endpoint}/`, data),
    
    // Actualizar completamente un registro
    update: (id, data) => api.put(`${endpoint}/${id}/`, data),
    
    // Actualización parcial de un registro
    partialUpdate: (id, data) => api.patch(`${endpoint}/${id}/`, data),
    
    // Eliminar un registro
    delete: (id) => api.delete(`${endpoint}/${id}/`),
  };
};

/**
 * Extiende un API base con métodos personalizados
 * 
 * @param {string} endpoint - El endpoint de la API
 * @param {object} customMethods - Objeto con métodos personalizados adicionales
 * @returns {object} Objeto con métodos CRUD + métodos personalizados
 * 
 * Ejemplo de uso:
 * const clientesAPI = createExtendedAPI('/clientes/cliente', {
 *   getActivos: () => api.get('/clientes/cliente/activos/'),
 *   activar: (id) => api.post(`/clientes/cliente/${id}/activar/`)
 * });
 */
export const createExtendedAPI = (endpoint, customMethods = {}) => {
  const baseAPI = createCrudAPI(endpoint);
  return {
    ...baseAPI,
    ...customMethods,
  };
};