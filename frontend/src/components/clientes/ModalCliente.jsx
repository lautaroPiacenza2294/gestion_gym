import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, CreditCard, AlertCircle, Save, Loader2, Calendar, ClipboardList, DollarSign } from 'lucide-react';
import { clientesAPI, planesAPI, membresiasAPI } from '../../services';
import { pagosAPI } from '../../services/finanzas';

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

  const getDefaultPlanData = () => {
    const hoy = new Date().toISOString().split('T')[0];
    const unMesDespues = new Date();
    unMesDespues.setMonth(unMesDespues.getMonth() + 1);
    return {
      asignarPlan: false,
      plan: '',
      fecha_inicio: hoy,
      fecha_fin: unMesDespues.toISOString().split('T')[0],
    };
  };

  const getDefaultPagoData = () => ({
    registrarPago: false,
    monto: '',
    metodo_pago: 'efectivo',
  });

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [planes, setPlanes] = useState([]);
  const [planData, setPlanData] = useState(getDefaultPlanData);
  const [pagoData, setPagoData] = useState(getDefaultPagoData);

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
        setPlanData(getDefaultPlanData());
      }
    };
    cargarDatos();
  }, [isEditMode, clienteToEdit, isOpen]);

  // Cargar planes activos en modo creación
  useEffect(() => {
    if (!isEditMode && isOpen) {
      planesAPI.getAll()
        .then(res => setPlanes((res.data || []).filter(p => p.activo)))
        .catch(() => setPlanes([]));
    }
  }, [isEditMode, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePlanChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlanData(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'asignarPlan' && !checked) {
        updated.plan = '';
        setPagoData(getDefaultPagoData());
      }
      return updated;
    });
    // Auto-completar monto al seleccionar plan
    if (name === 'plan' && value) {
      const planSeleccionado = planes.find(p => p.id === parseInt(value));
      if (planSeleccionado) {
        setPagoData(prev => ({ ...prev, monto: planSeleccionado.precio }));
      }
    }
  };

  const handlePagoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPagoData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validateForm = () => {
    const obligatorios = ['nombre', 'apellido', 'telefono', 'dni', 'contacto_emergencia'];
    const faltantes = obligatorios.filter(field => !formData[field]?.trim());
    if (faltantes.length > 0) {
      setError('Por favor, completa todos los campos obligatorios (*)');
      return false;
    }
    if (!isEditMode && planData.asignarPlan) {
      if (!planData.plan) {
        setError('Seleccioná un plan o desmarcá la opción de asignar plan');
        return false;
      }
      if (planData.fecha_fin <= planData.fecha_inicio) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEditMode) {
        await clientesAPI.update(clienteToEdit.id, formData);
      } else {
        const clienteRes = await clientesAPI.create(formData);

        // Si se seleccionó un plan, crear la membresía
        if (planData.asignarPlan && planData.plan) {
          let membresiaId = null;
          try {
            const membresiaRes = await membresiasAPI.create({
              cliente: clienteRes.data.id,
              plan: parseInt(planData.plan),
              fecha_inicio: planData.fecha_inicio,
              fecha_fin: planData.fecha_fin,
              estado: 'activa',
            });
            membresiaId = membresiaRes.data.id;
          } catch (membresiaErr) {
            console.error('Error al crear membresía:', membresiaErr);
            setError('El cliente se creó, pero hubo un error al asignar el plan. Podés asignarlo manualmente desde membresías.');
            onSuccess();
            return;
          }

          // Si se eligió registrar pago, crearlo
          if (pagoData.registrarPago && pagoData.monto) {
            try {
              await pagosAPI.create({
                cliente: clienteRes.data.id,
                membresia: membresiaId,
                fecha_pago: new Date().toISOString().split('T')[0],
                monto: pagoData.monto,
                metodo_pago: pagoData.metodo_pago,
                concepto: 'membresia',
              });
            } catch (pagoErr) {
              console.error('Error al registrar pago:', pagoErr);
              // No interrumpir el flujo, el pago puede registrarse después
            }
          }
        }
      }

      onSuccess();
      setFormData(initialFormData);
      setPlanData(getDefaultPlanData());
      setPagoData(getDefaultPagoData());
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

        <div className="p-6 max-h-[75vh] overflow-y-auto">
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

              {/* Sección Asignar Plan - Solo en modo creación */}
              {!isEditMode && (
                <div className="border-t border-gray-100 pt-5">
                  <label className="flex items-center gap-3 cursor-pointer group mb-4">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        name="asignarPlan"
                        checked={planData.asignarPlan}
                        onChange={handlePlanChange}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <ClipboardList size={16} className="text-blue-500" />
                      <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                        Asignar un plan de membresía
                      </span>
                    </div>
                  </label>

                  {planData.asignarPlan && (
                    <div className="space-y-4 pl-8">
                      <div className="relative">
                        <label className={labelClass}>Plan *</label>
                        <ClipboardList className="absolute left-3 top-[34px] text-gray-400" size={16} />
                        <select
                          name="plan"
                          value={planData.plan}
                          onChange={handlePlanChange}
                          className={inputClass}
                        >
                          <option value="">Seleccionar plan</option>
                          {planes.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.nombre} - ${new Intl.NumberFormat('es-AR').format(p.precio)}/mes
                            </option>
                          ))}
                        </select>
                        {planes.length === 0 && (
                          <p className="text-xs text-amber-600 mt-1">
                            No hay planes activos. Creá un plan primero.
                          </p>
                        )}
                      </div>

                      {planData.plan && (
                        <>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="relative">
                              <label className={labelClass}>Fecha Inicio</label>
                              <Calendar className="absolute left-3 top-[34px] text-gray-400" size={16} />
                              <input
                                type="date"
                                name="fecha_inicio"
                                value={planData.fecha_inicio}
                                onChange={handlePlanChange}
                                className={inputClass}
                              />
                            </div>
                            <div className="relative">
                              <label className={labelClass}>Fecha Fin</label>
                              <Calendar className="absolute left-3 top-[34px] text-gray-400" size={16} />
                              <input
                                type="date"
                                name="fecha_fin"
                                value={planData.fecha_fin}
                                onChange={handlePlanChange}
                                className={inputClass}
                              />
                            </div>
                          </div>

                          {/* Opción de registrar pago */}
                          <div className="mt-3 border-t border-gray-100 pt-3">
                            <label className="flex items-center gap-3 cursor-pointer group mb-3">
                              <input
                                type="checkbox"
                                name="registrarPago"
                                checked={pagoData.registrarPago}
                                onChange={handlePagoChange}
                                className="w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              <div className="flex items-center gap-2">
                                <DollarSign size={16} className="text-emerald-500" />
                                <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                                  Registrar pago ahora
                                </span>
                              </div>
                            </label>

                            {pagoData.registrarPago && (
                              <div className="grid md:grid-cols-2 gap-4 pl-8">
                                <div className="relative">
                                  <label className={labelClass}>Monto *</label>
                                  <DollarSign className="absolute left-3 top-[34px] text-gray-400" size={16} />
                                  <input
                                    type="number"
                                    name="monto"
                                    value={pagoData.monto}
                                    onChange={handlePagoChange}
                                    placeholder="0"
                                    className={inputClass}
                                  />
                                </div>
                                <div className="relative">
                                  <label className={labelClass}>Método de pago</label>
                                  <select
                                    name="metodo_pago"
                                    value={pagoData.metodo_pago}
                                    onChange={handlePagoChange}
                                    className={`${inputClass} !pl-4`}
                                  >
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">Transferencia</option>
                                    <option value="tarjeta_debito">Tarjeta débito</option>
                                    <option value="tarjeta_credito">Tarjeta crédito</option>
                                    <option value="mercado_pago">Mercado Pago</option>
                                  </select>
                                </div>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

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