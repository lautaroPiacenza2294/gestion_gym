// src/pages/Planes.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Dumbbell, AlertCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PlanCard from '../components/planes/PlanCard';
import PlanModal from '../components/planes/PlanModal';
import { planesAPI } from '../services';
    
const Planes = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [filtroActivo, setFiltroActivo] = useState('todos'); // todos, activos, inactivos

  // Cargar planes
  const fetchPlanes = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const response = await planesAPI.getAll();
      setPlanes(response.data);
    } catch (err) {
      setError('Error al cargar los planes');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  // Abrir modal para crear
  const handleCreate = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar
  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  // Después de crear/editar exitosamente
  const handleSuccess = () => {
    fetchPlanes(false);
    handleCloseModal();
  };

  // Filtrar planes
  const planesFiltrados = planes.filter(plan => {
    if (filtroActivo === 'activos') return plan.activo;
    if (filtroActivo === 'inactivos') return !plan.activo;
    return true; // todos
  });

  // Loading
  if (loading) {
    return (
      <Layout title="Gestión de Planes">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 font-medium">Cargando planes...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error
  if (error) {
    return (
      <Layout title="Gestión de Planes">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="text-red-600 mt-0.5" size={20} />
            <div>
              <h3 className="text-red-800 font-bold">Error</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button
                onClick={fetchPlanes}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestión de Planes">
      <div className="space-y-6">
        {/* Header con filtros y botón crear */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Filtros */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFiltroActivo('todos')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filtroActivo === 'todos'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Todos ({planes.length})
            </button>
            <button
              onClick={() => setFiltroActivo('activos')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filtroActivo === 'activos'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Activos ({planes.filter(p => p.activo).length})
            </button>
            <button
              onClick={() => setFiltroActivo('inactivos')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                filtroActivo === 'inactivos'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Inactivos ({planes.filter(p => !p.activo).length})
            </button>
          </div>

          {/* Botón Crear */}
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            <span>Nuevo Plan</span>
          </button>
        </div>

        {/* Lista de planes */}
        {planesFiltrados.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <Dumbbell className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-600 mb-2">
              No hay planes {filtroActivo !== 'todos' && filtroActivo}
            </h3>
            <p className="text-slate-500 text-sm">
              {filtroActivo === 'todos'
                ? 'Creá tu primer plan para comenzar'
                : `No hay planes ${filtroActivo} en este momento`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planesFiltrados.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={() => handleEdit(plan)}
                onRefresh={fetchPlanes}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <PlanModal
          plan={selectedPlan}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </Layout>
  );
};

export default Planes;