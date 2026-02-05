import axios from 'axios';

// ============================================
// CONFIGURACIÓN BASE
// ============================================

// URL base de tu API Django
const API_URL = 'http://localhost:8000/api';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// ============================================
// INTERCEPTORES (para manejar errores globalmente)
// ============================================

// Interceptor de respuestas para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Aquí puedes manejar errores globales
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Error del servidor:', error.response.data);
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      console.error('Sin respuesta del servidor');
    } else {
      // Algo pasó al configurar la petición
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;