import { useState } from 'react';
import Layout from '../components/layout/Layout';
import ListaClientes from '../components/clientes/ListaClientes';
import BotonCrearCliente from '../components/clientes/BotonCrearCliente';
import ModalCliente from '../components/clientes/ModalCliente';
import { clientesAPI } from '../services';

const Clientes = () => {
  const [refresh, setRefresh] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteToEdit, setClienteToEdit] = useState(null);

  const refrescarLista = () => {
    setRefresh(prev => prev + 1);
  };

  const handleCrearCliente = () => {
    setClienteToEdit(null);
    setModalOpen(true);
  };

  const handleSuccess = () => {
    refrescarLista();
    setModalOpen(false);
  };

  const handleVerDetalle = (cliente) => {
    console.log('Ver detalles de membresía:', cliente);
    alert(`Ver detalles de membresía de ${cliente.nombre} ${cliente.apellido}`);
  };

  const handleEditar = (cliente) => {
    setClienteToEdit(cliente);
    setModalOpen(true);
  };

  const handleEliminar = async (cliente) => {
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas ${cliente.activo ? 'desactivar' : 'activar'} a ${cliente.nombre} ${cliente.apellido}?`
    );

    if (confirmar) {
      try {
        await clientesAPI.partialUpdate(cliente.id, {
          activo: !cliente.activo
        });

        alert(
          `Cliente ${cliente.nombre} ${cliente.apellido} ${cliente.activo ? 'desactivado' : 'activado'} exitosamente`
        );

        refrescarLista();
      } catch (error) {
        console.error('Error cambiando estado del cliente:', error);
        alert('Error al cambiar el estado del cliente. Por favor, intenta de nuevo.');
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Clientes
          </h1>

          <BotonCrearCliente onClick={handleCrearCliente} />
        </div>

        {/* Lista */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <ListaClientes 
            onVerDetalle={handleVerDetalle}
            onEditar={handleEditar}
            onEliminar={handleEliminar}
            refresh={refresh}
          />
        </div>

        {/* Modal */}
        <ModalCliente
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
          clienteToEdit={clienteToEdit}
        />
      </div>
    </Layout>
  );
};

export default Clientes;
