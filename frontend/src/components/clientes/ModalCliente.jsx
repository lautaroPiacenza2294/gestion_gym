import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, CreditCard, AlertCircle, Save, Loader2 } from 'lucide-react';
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
          setFormData({
            nombre: res.data.nombre || '',
            apellido: res.data.apellido || '',
            email: res.data.email || '',
            telefono: res.data.telefono || '',
            fecha_nacimiento: res.data.fecha_nacimiento || '',
            direccion: res.data.direccion || '',
            dni: res.data.dni || '',
            contacto_emergencia: res.data.contacto_emergencia || '',
            activo: res.data.activo ?? true,
          });
        } catch {
          setError('Error al cargar datos del cliente');
        } finally {
          setLoadingData(false);
        }
      } else if (!isEditMode) {
        setFormData({
          nombre: '',
          apellido: '',
          email: '',
          telefono: '',
          fecha_nacimiento: '',
          direccion: '',
          dni: '',
          contacto_emergencia: '',
          activo: true,
        });
      }
    };
    cargarDatos();
  }, [isEditMode, clienteToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateForm = () => {
    const obligatorios = ['nombre', 'apellido', 'telefono', 'dni', 'contacto_emergencia'];
    const faltantes = obligatorios.filter(field => !formData[field]?.trim());
    if (faltantes.length > 0) {
      setError('Por favor, completa todos los campos obligatorios (*)');
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
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        fecha_nacimiento: '',
        direccion: '',
        dni: '',
        contacto_emergencia: '',
        activo: true,
      });
      onClose();
    } catch {
      setError('Hubo un problema al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = "w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Editar Perfil' : 'Registro de Cliente'}</h2>
            <p className="text-xs text-gray-500">Completa la información necesaria del cliente</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-sm">
              <AlertCircle size={18} />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {loadingData ? (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p>Obteniendo información...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className={labelClass}>Nombre *</label>
                  <User className="absolute left-3 top-[34px] text-gray-400" size={16} />
                  <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Juan" className={inputClass} />
                </div>
                <div className="relative">
                  <label className={labelClass}>Apellido *</label>
                  <User className="absolute left-3 top-[34px] text-gray-400" size={16} />
                  <input name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Ej: Pérez" className={inputClass} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className={labelClass}>Email</label>
                  <Mail className="absolute left-3 top-[34px] text-gray-400" size={16} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" className={inputClass} />
                </div>
                <div className="relative">
                  <label className={labelClass}>Teléfono *</label>
                  <Phone className="absolute left-3 top-[34px] text-gray-400" size={16} />
                  <input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="+54 9 11..." className={inputClass} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className={labelClass}>DNI *</label>
                  <CreditCard className="absolute left-3 top-[34px] text-gray-400" size={16} />
                  <input name="dni" value={formData.dni} onChange={handleChange} placeholder="Número de documento" className={inputClass} />
                </div>
                <div className="relative">
                  <label className={labelClass}>Fecha de Nacimiento</label>
                  <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} className={`${inputClass} !pl-4`} />
                </div>
              </div>

              <div className="grid md:grid-cols-1 gap-4">
                <div className="relative">
                  <label className={labelClass}>Dirección</label>
                  <MapPin className="absolute left-3 top-[34px] text-gray-400" size={16} />
                  <input name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Calle, Número, Localidad" className={inputClass} />
                </div>
                <div className="relative">
                  <label className={labelClass}>Contacto de Emergencia *</label>
                  <AlertCircle className="absolute left-3 top-[34px] text-gray-400" size={16} />
                  <input name="contacto_emergencia" value={formData.contacto_emergencia} onChange={handleChange} placeholder="Nombre y teléfono de un familiar" className={inputClass} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      name="activo" 
                      checked={formData.activo} 
                      onChange={handleChange} 
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                    Cliente con cuenta activa
                  </span>
                </label>

                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={onClose} 
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    {loading ? 'Guardando...' : 'Guardar Cliente'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalCliente;