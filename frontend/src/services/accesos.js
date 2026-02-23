import api from './axiosConfig';

const accesosAPI = {
  buscarDni: (dni) => api.post('/accesos/acceso/buscar/', { dni }),
  validarDni: (dni) => api.post('/accesos/acceso/validar/', { dni }),
  getHoy: () => api.get('/accesos/acceso/hoy/'),
  getStatsHoy: () => api.get('/accesos/acceso/stats_hoy/'),
  getHistorial: (fecha) => api.get('/accesos/acceso/', { params: fecha ? { fecha } : {} }),
};

export default accesosAPI;
