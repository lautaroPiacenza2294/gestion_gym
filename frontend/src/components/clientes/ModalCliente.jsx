import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { clientesAPI } from '../../services';

const ModalCliente = ({ isOpen, onClose, onSuccess, clienteToEdit = null }) => {
  const isEditMode = !!clienteToEdit;

  const initialFormData = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    direccion: '',
    dni: '',
    contacto_emergencia: '',
    activo: true,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      if (isEditMode && clienteToEdit && isOpen) {
        try {
          setLoadingData(true);
          const res = await clientesAPI.getById(clienteToEdit.id);
          setFormData(res.data);
        } catch {
          setError('Error al cargar datos del cliente');
        } finally {
          setLoadingData(false);
        }
      } else {
        setFormData(initialFormData);
      }
    };
    cargarDatos();
  }, [isEditMode, clienteToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateForm = () => {
    if (!formData.nombre || !formData.apellido || !formData.telefono || !formData.dni || !formData.contacto_emergencia) {
      setError('Completá todos los campos obligatorios');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    try {
      setLoading(true);
      isEditMode
        ? await clientesAPI.update(clienteToEdit.id, formData)
        : await clientesAPI.create(formData);

      onSuccess();
      onClose();
    } catch {
      setError('Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-red-500">
          <X size={22} />
        </button>

        <h2 className="text-xl font-semibold mb-4">{isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>

        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-3">{error}</div>}

        {loadingData ? (
          <p className="text-center py-6">Cargando datos...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre *" className="input" />
              <input name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido *" className="input" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="input" />
              <input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono *" className="input" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <input name="dni" value={formData.dni} onChange={handleChange} placeholder="DNI *" className="input" />
              <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className="input" />
            </div>

            <input name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección" className="input" />
            <input name="contacto_emergencia" value={formData.contacto_emergencia} onChange={handleChange} placeholder="Contacto de Emergencia *" className="input" />

            <label className="flex items-center gap-2">
              <input type="checkbox" name="activo" checked={formData.activo} onChange={handleChange} />
              Cliente activo
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancelar</button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalCliente;
