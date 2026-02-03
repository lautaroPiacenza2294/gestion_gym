import { useState, useEffect } from 'react';
import { clientesAPI } from '../../services';
import TablaClientes from './TablaClientes';
import './clientes.css';

const ListaClientes = ({ onVerDetalle, onEditar, onEliminar, refresh }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar clientes
  const cargarClientes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clientesAPI.getAll();
      setClientes(response.data);
    } catch (err) {
      console.error('Error cargando clientes:', err);
      setError('Error al cargar los clientes. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar y cuando cambie refresh
  useEffect(() => {
    cargarClientes();
  }, [refresh]);

  // Estado de carga
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando clientes...</p>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button 
          onClick={cargarClientes}
          className="btn-crear-cliente"
          style={{ marginTop: '1rem' }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Sin clientes
  if (clientes.length === 0) {
    return (
      <div className="empty-container">
        <p>No hay clientes registrados todavía.</p>
        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Haz clic en "Nuevo Cliente" para agregar el primero.
        </p>
      </div>
    );
  }

  // Lista de clientes
  return (
    <TablaClientes 
      clientes={clientes}
      onVerDetalle={onVerDetalle}
      onEditar={onEditar}
      onEliminar={onEliminar}
    />
  );
};

export default ListaClientes;