import { useState } from 'react';
import Layout from '../components/layout/Layout';
import ListaClientes from '../components/clientes/ListaClientes';
import BotonCrearCliente from '../components/clientes/BotonCrearCliente';
import '../components/clientes/clientes.css';

const Clientes = () => {
  const [refresh, setRefresh] = useState(0);

  // Función para refrescar la lista
  const refrescarLista = () => {
    setRefresh(prev => prev + 1);
  };

  // Handler para crear cliente
  const handleCrearCliente = () => {
    // TODO: Abrir modal o navegar a formulario de creación
    console.log('Crear nuevo cliente');
    alert('Funcionalidad de crear cliente - Próximamente implementaremos el formulario');
  };

  // Handler para ver detalles de membresía
  const handleVerDetalle = (cliente) => {
    // TODO: Abrir modal o navegar a detalles de membresía
    console.log('Ver detalles de membresía:', cliente);
    alert(`Ver detalles de membresía de ${cliente.nombre} ${cliente.apellido}`);
  };

  // Handler para editar cliente
  const handleEditar = (cliente) => {
    // TODO: Abrir modal o navegar a formulario de edición
    console.log('Editar cliente:', cliente);
    alert(`Editar cliente: ${cliente.nombre} ${cliente.apellido}`);
  };

  // Handler para eliminar cliente
  const handleEliminar = async (cliente) => {
    // Confirmar eliminación
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar a ${cliente.nombre} ${cliente.apellido}?`
    );
    
    if (confirmar) {
      try {
        // TODO: Implementar eliminación con clientesAPI.delete(cliente.id)
        console.log('Eliminar cliente:', cliente);
        alert(`Cliente ${cliente.nombre} ${cliente.apellido} eliminado (simulado)`);
        
        // Refrescar lista después de eliminar
        refrescarLista();
      } catch (error) {
        console.error('Error eliminando cliente:', error);
        alert('Error al eliminar el cliente. Por favor, intenta de nuevo.');
      }
    }
  };

  return (
    <Layout>
      <div className="clientes-container">
        {/* Header con título y botón de crear */}
        <div className="clientes-header">
          <h1>Gestión de Clientes</h1>
          <BotonCrearCliente onClick={handleCrearCliente} />
        </div>

        {/* Lista de clientes */}
        <ListaClientes 
          onVerDetalle={handleVerDetalle}
          onEditar={handleEditar}
          onEliminar={handleEliminar}
          refresh={refresh}
        />
      </div>
    </Layout>
  );
};

export default Clientes;